const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const { dateRange, startDate, endDate, search, status, date } = req.query;
    const labId = req.query.lab_id || req.lab_id;

    const params = [];
    let whereClause = '1=1';
    let andWhereClause = '';
    let joinWhereClause = '';

    if (labId && labId !== '') {
      params.push(labId);
      whereClause = 'lab_id = ?';
      andWhereClause = 'AND lab_id = ?';
      joinWhereClause = 'AND o.lab_id = ?';
    }

    // Total patients
    const [patientCount] = await db.query(`SELECT COUNT(*) as count FROM patients WHERE is_active = TRUE ${andWhereClause}`, params);

    // Total doctors
    const [doctorCount] = await db.query(`SELECT COUNT(*) as count FROM doctors WHERE is_active = TRUE ${andWhereClause}`, params);

    // Total orders
    const [totalOrdersCount] = await db.query(`SELECT COUNT(*) as count FROM patient_test_orders WHERE ${whereClause}`, params);

    // Total users
    const [userCount] = await db.query(`SELECT COUNT(*) as count FROM users WHERE is_active = TRUE ${andWhereClause}`, params);

    // Total orders today
    const [todayOrders] = await db.query(
      `SELECT COUNT(*) as count FROM patient_test_orders WHERE DATE(created_at) = CURDATE() ${andWhereClause}`,
      params
    );

    // Pending orders
    const [pendingOrders] = await db.query(
      `SELECT COUNT(*) as count FROM patient_test_orders WHERE status IN ('pending', 'sample_collected', 'in_progress') ${andWhereClause}`,
      params
    );

    // Today's revenue
    const [todayRevenue] = await db.query(
      `SELECT SUM(p.amount) as revenue FROM payments p JOIN patient_test_orders o ON p.order_id = o.id WHERE DATE(p.payment_date) = CURDATE() ${joinWhereClause}`,
      params
    );

    // Total received payments
    const [totalReceivedPayments] = await db.query(
      `SELECT SUM(paid_amount) as total FROM patient_test_orders WHERE paid_amount > 0 ${andWhereClause}`,
      params
    );

    // Total unpaid payments
    const [totalUnpaidPayments] = await db.query(
      `SELECT SUM(total_amount - paid_amount) as total FROM patient_test_orders WHERE (total_amount - paid_amount) > 0 ${andWhereClause}`,
      params
    );

    // Recent orders
    let recentOrdersQuery = `SELECT o.id, o.order_number, o.status, o.created_at, p.name as patient_name, p.patient_code
                           FROM patient_test_orders o
                           JOIN patients p ON o.patient_id = p.id
                           WHERE 1=1 ${andWhereClause.replace('AND', 'AND o.')}`;
    const recentOrdersParams = params.slice();

    if (search) {
      recentOrdersQuery += ' AND (o.order_number LIKE ? OR p.name LIKE ?)';
      recentOrdersParams.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      recentOrdersQuery += ' AND o.status = ?';
      recentOrdersParams.push(status);
    }
    if (date) {
      recentOrdersQuery += ' AND DATE(o.created_at) = ?';
      recentOrdersParams.push(date);
    }
    recentOrdersQuery += ' ORDER BY o.created_at DESC LIMIT 10';
    const [recentOrders] = await db.query(recentOrdersQuery, recentOrdersParams);

    // Orders by status
    const [ordersByStatus] = await db.query(
      `SELECT status, COUNT(*) as count FROM patient_test_orders WHERE ${whereClause} GROUP BY status`,
      params
    );

    // Revenue by month
    const [revenueByMonth] = await db.query(
      `SELECT DATE_FORMAT(p.payment_date, '%Y-%m') as month, SUM(p.amount) as revenue
       FROM payments p
       JOIN patient_test_orders o ON p.order_id = o.id
       WHERE p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) ${joinWhereClause}
       GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m') ORDER BY month ASC`,
      params
    );

    // Top tests
    let topTestsQuery = `SELECT t.name, COUNT(*) as count
       FROM patient_test_order_items oi
       JOIN tests t ON oi.test_id = t.id
       JOIN patient_test_orders o ON oi.order_id = o.id
       WHERE 1=1 ${andWhereClause.replace('AND', 'AND o.')}`;
    const topTestsParams = params.slice();

    if (dateRange === 'custom' && startDate && endDate) {
      topTestsQuery += ' AND oi.created_at BETWEEN ? AND ?';
      topTestsParams.push(startDate, endDate);
    } else if (dateRange === '7') {
      topTestsQuery += ' AND oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (dateRange === '14') {
      topTestsQuery += ' AND oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)';
    } else {
      topTestsQuery += ' AND oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }
    topTestsQuery += ' GROUP BY t.id, t.name ORDER BY count DESC LIMIT 5';
    const [topTests] = await db.query(topTestsQuery, topTestsParams);


    res.json({
      stats: {
        totalPatients: patientCount[0].count,
        totalDoctors: doctorCount[0].count,
        totalOrders: totalOrdersCount[0].count,
        totalUsers: userCount[0].count,
        todayOrders: todayOrders[0].count,
        pendingOrders: pendingOrders[0].count,
        todayRevenue: todayRevenue[0].revenue || 0,
        totalReceivedPayments: totalReceivedPayments[0].total || 0,
        totalUnpaidPayments: totalUnpaidPayments[0].total || 0
      },
      recentOrders,
      ordersByStatus,
      revenueByMonth,
      topTests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
