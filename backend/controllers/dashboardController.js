const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total patients
    const [patientCount] = await db.query('SELECT COUNT(*) as count FROM patients WHERE is_active = TRUE');

    // Total doctors
    const [doctorCount] = await db.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = TRUE');

    // Total orders
    const [totalOrdersCount] = await db.query('SELECT COUNT(*) as count FROM patient_test_orders');

    // Total users
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');

    // Total orders today
    const [todayOrders] = await db.query(
      'SELECT COUNT(*) as count FROM patient_test_orders WHERE DATE(created_at) = CURDATE()'
    );

    // Pending orders
    const [pendingOrders] = await db.query(
      'SELECT COUNT(*) as count FROM patient_test_orders WHERE status IN ("pending", "sample_collected", "in_progress")'
    );

    // Today's revenue
    const [todayRevenue] = await db.query(
      'SELECT SUM(amount) as revenue FROM payments WHERE DATE(payment_date) = CURDATE()'
    );

    // Total received payments
    const [totalReceivedPayments] = await db.query(
      'SELECT SUM(paid_amount) as total FROM patient_test_orders WHERE paid_amount > 0'
    );

    // Total unpaid payments (total_amount - paid_amount for all orders)
    const [totalUnpaidPayments] = await db.query(
      'SELECT SUM(total_amount - paid_amount) as total FROM patient_test_orders WHERE (total_amount - paid_amount) > 0'
    );

    // Recent orders
    const [recentOrders] = await db.query(
      `SELECT o.id, o.order_number, o.status, o.created_at, 
              p.name as patient_name, p.patient_code
       FROM patient_test_orders o
       JOIN patients p ON o.patient_id = p.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Orders by status
    const [ordersByStatus] = await db.query(
      `SELECT status, COUNT(*) as count 
       FROM patient_test_orders 
       GROUP BY status`
    );

    // Revenue by month (last 6 months)
    const [revenueByMonth] = await db.query(
      `SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as revenue
       FROM payments
       WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
       ORDER BY month ASC`
    );

    // Top tests
    const [topTests] = await db.query(
      `SELECT t.name, COUNT(*) as count
       FROM patient_test_order_items oi
       JOIN tests t ON oi.test_id = t.id
       WHERE oi.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY t.id, t.name
       ORDER BY count DESC
       LIMIT 5`
    );

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
