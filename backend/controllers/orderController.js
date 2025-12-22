const db = require('../config/database');
const emailService = require('../services/emailService');

exports.getAllOrders = async (req, res) => {
  try {
    const { status, payment_status, search, page = 1, limit = 10, dateFrom, dateTo } = req.query;
    const labId = req.query.lab_id || req.lab_id;
    const offset = (page - 1) * limit;

    let baseQuery = `FROM patient_test_orders o
                     LEFT JOIN patients p ON o.patient_id = p.id
                     LEFT JOIN doctors d ON o.doctor_id = d.id`;
    let whereClause = ' WHERE 1=1';
    let params = [];

    if (labId) {
      whereClause += ' AND o.lab_id = ?';
      params.push(labId);
    }

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }
    if (payment_status) {
      whereClause += ' AND o.payment_status = ?';
      params.push(payment_status);
    }
    if (search) {
      whereClause += ' AND (o.order_number LIKE ? OR p.name LIKE ? OR p.patient_code LIKE ? OR d.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (dateFrom) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      params.push(dateTo);
    }

    const [countResult] = await db.query(`SELECT COUNT(*) as total ${baseQuery} ${whereClause}`, params);
    const total = countResult[0].total;

    const dataQuery = `SELECT o.*, p.name as patient_name, p.patient_code, d.name as doctor_name ${baseQuery} ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.query(dataQuery, params);

    res.json({
      data: orders,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = `SELECT o.*, p.name as patient_name, p.patient_code, p.age, p.gender, p.phone,
                     d.name as doctor_name, d.specialization,
                     u.full_name as created_by_name
              FROM patient_test_orders o
              LEFT JOIN patients p ON o.patient_id = p.id
              LEFT JOIN doctors d ON o.doctor_id = d.id
              LEFT JOIN users u ON o.created_by = u.id
              WHERE o.id = ?`;
    const params = [req.params.id];

    if (labId) {
      query += ' AND o.lab_id = ?';
      params.push(labId);
    }

    const [orders] = await db.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [items] = await db.query(
      `SELECT oi.*, tr.result_value, tr.result_text, tr.unit, tr.normal_range, tr.status as result_status, tr.remarks
       FROM patient_test_order_items oi
       LEFT JOIN test_results tr ON oi.id = tr.order_item_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    const [payments] = await db.query(
      `SELECT p.*, u.full_name as received_by_name
       FROM payments p
       LEFT JOIN users u ON p.received_by = u.id
       WHERE p.order_id = ?`,
      [req.params.id]
    );

    res.json({
      ...orders[0],
      items,
      payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    console.log('begin-transaction');
    const { patient_id, doctor_id, priority, notes, tests, discount = 0 } = req.body;
    const lab_id = req.body.lab_id || req.lab_id;

    if (!lab_id) {
      return res.status(400).json({ error: 'Lab ID is required' });
    }
    console.log(req.body);

    // Generate order number
    const [lastOrder] = await connection.query('SELECT order_number FROM patient_test_orders ORDER BY id DESC LIMIT 1');
    let orderNumber = 'ORD0001';
    if (lastOrder.length > 0) {
      const lastNum = parseInt(lastOrder[0].order_number.replace('ORD', ''));
      orderNumber = 'ORD' + String(lastNum + 1).padStart(4, '0');
    }

    // Calculate total
    const total_amount = tests.reduce((sum, test) => sum + parseFloat(test.price), 0);

    const [orderResult] = await connection.query(
      `INSERT INTO patient_test_orders (order_number, patient_id, doctor_id, priority, total_amount, discount, notes, created_by, lab_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, patient_id, doctor_id, priority, total_amount, discount, notes, req.user.id, lab_id]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const test of tests) {
      await connection.query(
        'INSERT INTO patient_test_order_items (order_id, test_id, test_name, price) VALUES (?, ?, ?, ?)',
        [orderId, test.id, test.name, test.price]
      );
    }
    await connection.commit();

    res.status(201).json({ 
      message: 'Order created successfully', 
      id: orderId, 
      order_number: orderNumber 
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

exports.updateOrderStatus = async (req, res) => {
  console.log('update-order-status');
  try {
    const { status } = req.body;
    console.log('status = ' + status);
    const labId = req.lab_id;
    let query = 'UPDATE patient_test_orders SET status = ? WHERE id = ?';
    const params = [status, req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found or you do not have permission to update it.' });
    }

    if (status.toUpperCase() === 'COMPLETED') {
      console.log('called----------------');
      // Fetch order details for email
      let orderDetailsQuery = `SELECT o.order_number, p.email, p.name as patient_name
                               FROM patient_test_orders o
                               JOIN patients p ON o.patient_id = p.id
                               WHERE o.id = ?`;
      const orderDetailsParams = [req.params.id];

      if (labId) {
        orderDetailsQuery += ' AND o.lab_id = ?';
        orderDetailsParams.push(labId);
      }

      const [orderDetails] = await db.query(orderDetailsQuery, orderDetailsParams);

      if (orderDetails.length > 0) {
        const order = orderDetails[0];
        const reportUrl = `${process.env.FRONTEND_URL}/orders/${req.params.id}`;
        await emailService.sendReportEmail(order.email, order.patient_name, order.order_number, reportUrl);
      }
    }
    console.log('outside of if statement.');

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { order_id, amount, payment_method, transaction_id, notes } = req.body;

    // Insert payment
    await connection.query(
      'INSERT INTO payments (order_id, amount, payment_method, transaction_id, notes, received_by) VALUES (?, ?, ?, ?, ?, ?)',
      [order_id, amount, payment_method, transaction_id, notes, req.user.id]
    );

    // Update order payment status
    let orderQuery = 'SELECT total_amount, discount, paid_amount FROM patient_test_orders WHERE id = ?';
    const orderParams = [order_id];

    if (req.lab_id) {
      orderQuery += ' AND lab_id = ?';
      orderParams.push(req.lab_id);
    }

    const [order] = await connection.query(orderQuery, orderParams);

    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found or you do not have permission to access it.' });
    }

    const newPaidAmount = parseFloat(order[0].paid_amount) + parseFloat(amount);
    const finalAmount = parseFloat(order[0].total_amount) - parseFloat(order[0].discount);

    let payment_status = 'partial';
    if (newPaidAmount >= finalAmount) {
      payment_status = 'paid';
    } else if (newPaidAmount === 0) {
      payment_status = 'unpaid';
    }

    await connection.query(
      'UPDATE patient_test_orders SET paid_amount = ?, payment_status = ? WHERE id = ?',
      [newPaidAmount, payment_status, order_id]
    );

    await connection.commit();

    res.status(201).json({ message: 'Payment added successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};
