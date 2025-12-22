const db = require('../config/database');

exports.getAllTests = async (req, res) => {
  try {
    const { search, category_id } = req.query;

    let query = `SELECT t.*, tc.name as category_name 
                 FROM tests t 
                 LEFT JOIN test_categories tc ON t.category_id = tc.id 
                 WHERE t.is_active = TRUE AND t.lab_id = ?`;
    let params = [req.lab_id];

    if (search) {
      query += ' AND (t.name LIKE ? OR t.test_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY t.name ASC';

    const [tests] = await db.query(query, params);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const [tests] = await db.query(
      `SELECT t.*, tc.name as category_name 
       FROM tests t 
       LEFT JOIN test_categories tc ON t.category_id = tc.id 
       WHERE t.id = ? AND t.lab_id = ?`,
      [req.params.id, req.lab_id]
    );

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
    const lab_id = req.lab_id;

    // Generate test code
    const [lastTest] = await db.query('SELECT test_code FROM tests WHERE lab_id = ? ORDER BY id DESC LIMIT 1', [lab_id]);
    let testCode = 'TEST0001';
    if (lastTest.length > 0) {
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

    await db.query(
      `UPDATE tests SET name = ?, category_id = ?, description = ?, price = ?, normal_range = ?, 
       unit = ?, sample_type = ?, preparation_instructions = ?, turnaround_time = ? WHERE id = ? AND lab_id = ?`,
      [name, category_id, description, price, normal_range, unit, sample_type, preparation_instructions, turnaround_time, req.params.id, req.lab_id]
    );

    res.json({ message: 'Test updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await db.query('UPDATE tests SET is_active = FALSE WHERE id = ? AND lab_id = ?', [req.params.id, req.lab_id]);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM test_categories WHERE is_active = TRUE AND lab_id = ? ORDER BY name ASC', [req.lab_id]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
