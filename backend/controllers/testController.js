const db = require('../config/database');

exports.getAllTests = async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 10 } = req.query;
    const labId = req.query.lab_id || req.lab_id;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE t.is_active = TRUE';
    let params = [];

    if (labId && labId !== '') {
      whereClause += ' AND t.lab_id = ?';
      params.push(labId);
    }
    if (search) {
      whereClause += ' AND (t.name LIKE ? OR t.test_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      whereClause += ' AND t.category_id = ?';
      params.push(category_id);
    }

    const dataQuery = `SELECT t.*, tc.name as category_name, l.name as lab_name FROM tests t LEFT JOIN test_categories tc ON t.category_id = tc.id JOIN labs l ON t.lab_id = l.id ${whereClause} ORDER BY t.name ASC LIMIT ? OFFSET ?`;
    const [tests] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    const countQuery = `SELECT COUNT(*) as total FROM tests t ${whereClause}`;
    const [countResult] = await db.query(countQuery, params);

    res.json({
      data: tests,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = `SELECT t.*, tc.name as category_name 
                 FROM tests t 
                 LEFT JOIN test_categories tc ON t.category_id = tc.id 
                 WHERE t.id = ?`;
    const params = [req.params.id];

    if (labId && labId !== '') {
      query += ' AND t.lab_id = ?';
      params.push(labId);
    }

    const [tests] = await db.query(query, params);

    if (tests.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(tests[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const { name, category_id, description, price, normal_range, unit, sample_type, preparation_instructions, turnaround_time } = req.body;
    const lab_id = req.body.lab_id || req.lab_id;

    if (!lab_id) {
      return res.status(400).json({ error: 'Lab ID is required' });
    }

    // Generate test code
    const [lastTest] = await db.query('SELECT test_code FROM tests WHERE lab_id = ? ORDER BY id DESC LIMIT 1', [lab_id]);
    let testCode = 'TEST0001';
    if (lastTest.length > 0 && lastTest[0].test_code) {
      const lastCode = parseInt(lastTest[0].test_code.replace('TEST', ''));
      testCode = 'TEST' + String(lastCode + 1).padStart(4, '0');
    }

    const [result] = await db.query(
      `INSERT INTO tests (test_code, name, category_id, description, price, normal_range, unit, sample_type, preparation_instructions, turnaround_time, lab_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [testCode, name, category_id, description, price, normal_range, unit, sample_type, preparation_instructions, turnaround_time, lab_id]
    );

    res.status(201).json({ message: 'Test created successfully', id: result.insertId, test_code: testCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { name, category_id, description, price, normal_range, unit, sample_type, preparation_instructions, turnaround_time } = req.body;
    const labId = req.lab_id;

    let query = `UPDATE tests SET name = ?, category_id = ?, description = ?, price = ?, normal_range = ?, 
                 unit = ?, sample_type = ?, preparation_instructions = ?, turnaround_time = ? WHERE id = ?`;
    const params = [name, category_id, description, price, normal_range, unit, sample_type, preparation_instructions, turnaround_time, req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test not found or you do not have permission to update it.' });
    }

    res.json({ message: 'Test updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = 'UPDATE tests SET is_active = FALSE WHERE id = ?';
    const params = [req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const labId = req.query.lab_id || req.lab_id;
    let query = 'SELECT * FROM test_categories WHERE is_active = TRUE';
    const params = [];

    if (labId && labId !== '') {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    query += ' ORDER BY name ASC';

    const [categories] = await db.query(query, params);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 

