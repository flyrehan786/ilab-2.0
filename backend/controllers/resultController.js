const db = require('../config/database');

exports.addResult = async (req, res) => {
  try {
    const { order_item_id, result_value, result_text, normal_range, unit, status, remarks } = req.body;
    const [result] = await db.query(
      `INSERT INTO test_results (order_item_id, result_value, result_text, normal_range, unit, status, remarks, tested_by, tested_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [order_item_id, result_value, result_text, normal_range, unit, status, remarks, 1]
    );

    // Update order item status
    await db.query('UPDATE patient_test_order_items SET status = ? WHERE id = ?', ['completed', order_item_id]);

    // Check if all items are completed
    const [items] = await db.query(
      'SELECT order_id FROM patient_test_order_items WHERE id = ?',
      [order_item_id]
    );

    const orderId = items[0].order_id;

    const [allItems] = await db.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM patient_test_order_items WHERE order_id = ?',
      [orderId]
    );

    if (allItems[0].total === allItems[0].completed) {
      await db.query('UPDATE patient_test_orders SET status = ? WHERE id = ?', ['completed', orderId]);
    } else {
      await db.query('UPDATE patient_test_orders SET status = ? WHERE id = ?', ['in_progress', orderId]);
    }

    res.status(201).json({ message: 'Result added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const { result_value, result_text, normal_range, unit, status, remarks } = req.body;

    await db.query(
      `UPDATE test_results SET result_value = ?, result_text = ?, normal_range = ?, unit = ?, status = ?, remarks = ? 
       WHERE id = ?`,
      [result_value, result_text, normal_range, unit, status, remarks, req.params.id]
    );

    res.json({ message: 'Result updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyResult = async (req, res) => {
  try {
    await db.query(
      'UPDATE test_results SET verified_by = ?, verified_at = NOW() WHERE id = ?',
      [req.user.id, req.params.id]
    );

    res.json({ message: 'Result verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResultsByOrder = async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT tr.*, oi.test_name, 
              u1.full_name as tested_by_name, u2.full_name as verified_by_name
       FROM test_results tr
       JOIN patient_test_order_items oi ON tr.order_item_id = oi.id
       LEFT JOIN users u1 ON tr.tested_by = u1.id
       LEFT JOIN users u2 ON tr.verified_by = u2.id
       WHERE oi.order_id = ?`,
      [req.params.orderId]
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
