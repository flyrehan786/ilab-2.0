const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get date range parameters for top tests
    const { dateRange, startDate, endDate } = req.query;
    
    // Total patients
    const [patientCount] = await db.query('SELECT COUNT(*) as count FROM patients WHERE is_active = TRUE AND lab_id = ?', [req.lab_id]);

    // Total doctors
    const [doctorCount] = await db.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = TRUE AND lab_id = ?', [req.lab_id]);

    // Total orders
    const [totalOrdersCount] = await db.query('SELECT COUNT(*) as count FROM patient_test_orders WHERE lab_id = ?', [req.lab_id]);

    // Total users
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE AND lab_id = ?', [req.lab_id]);

    // Total orders today
    const [todayOrders] = await db.query(
      'SELECT COUNT(*) as count FROM patient_test_orders WHERE DATE(created_at) = CURDATE() AND lab_id = ?', [req.lab_id]
    );

    // Pending orders
    const [pendingOrders] = await db.query(
      'SELECT COUNT(*) as count FROM patient_test_orders WHERE status IN ("pending", "sample_collected", "in_progress") AND lab_id = ?', [req.lab_id]
    );

    // Today's revenue
    const [todayRevenue] = await db.query(
      'SELECT SUM(p.amount) as revenue FROM payments p JOIN patient_test_orders o ON p.order_id = o.id WHERE DATE(p.payment_date) = CURDATE() AND o.lab_id = ?', [req.lab_id]
    );

    // Total received payments
    const [totalReceivedPayments] = await db.query(
      'SELECT SUM(paid_amount) as total FROM patient_test_orders WHERE paid_amount > 0 AND lab_id = ?', [req.lab_id]
    );

    // Total unpaid payments (total_amount - paid_amount for all orders)
    const [totalUnpaidPayments] = await db.query(
      'SELECT SUM(total_amount - paid_amount) as total FROM patient_test_orders WHERE (total_amount - paid_amount) > 0 AND lab_id = ?', [req.lab_id]
    );

    // Recent orders
    const [recentOrders] = await db.query(
      `SELECT o.id, o.order_number, o.status, o.created_at, 
              p.name as patient_name, p.patient_code
       FROM patient_test_orders o
       JOIN patients p ON o.patient_id = p.id
       WHERE o.lab_id = ?
       ORDER BY o.created_at DESC
       LIMIT 10`, [req.lab_id]
    );

    // Orders by status
    const [ordersByStatus] = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM patient_test_orders 
       WHERE lab_id = ?
       GROUP BY status`, [req.lab_id]
    );

    // Revenue by month (last 6 months)
    const [revenueByMonth] = await db.query(
      `SELECT DATE_FORMAT(p.payment_date, '%Y-%m') as month, SUM(p.amount) as revenue
       FROM payments p
       JOIN patient_test_orders o ON p.order_id = o.id
       WHERE p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND o.lab_id = ?
       GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
       ORDER BY month ASC`, [req.lab_id]
    );

    // Top tests with dynamic date range
    let topTestsQuery = `SELECT t.name, COUNT(*) as count
       FROM patient_test_order_items oi
       JOIN tests t ON oi.test_id = t.id
       JOIN patient_test_orders o ON oi.order_id = o.id
       WHERE o.lab_id = ? AND `;
    
    let dateCondition = '';
    const queryParams = [];
    
    if (dateRange === 'custom' && startDate && endDate) {
      dateCondition = 'oi.created_at >= ? AND oi.created_at <= ?';
      queryParams.push(startDate, endDate);
    } else if (dateRange === '7') {
      dateCondition = 'oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (dateRange === '14') {
      dateCondition = 'oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)';
    } else if (dateRange === '30') {
      dateCondition = 'oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else {
      // Default to 30 days
      dateCondition = 'oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }
    
    topTestsQuery += dateCondition + `
       GROUP BY t.id, t.name
       ORDER BY count DESC
       LIMIT 5`;
    
    const [topTests] = await db.query(topTestsQuery, queryParams);

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
