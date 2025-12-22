const db = require('../config/database');

exports.getAllCategoriesForDropdown = async (req, res) => {
  try {
    const labId = req.query.lab_id || req.lab_id;
    let query = 'SELECT id, name FROM test_categories WHERE is_active = TRUE';
    const params = [];

    if (labId) {
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

exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const labId = req.query.lab_id || req.lab_id;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = TRUE';
    let params = [];

    if (labId) {
      whereClause += ' AND lab_id = ?';
      params.push(labId);
    }
    if (search) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    const dataQuery = `SELECT * FROM test_categories ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`;
    const [categories] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    const countQuery = `SELECT COUNT(*) as total FROM test_categories ${whereClause}`;
    const [countResult] = await db.query(countQuery, params);

    res.json({
      data: categories,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const lab_id = req.body.lab_id || req.lab_id;

    if (!lab_id) {
      return res.status(400).json({ error: 'Lab ID is required' });
    }

    const [result] = await db.query(
      'INSERT INTO test_categories (name, lab_id) VALUES (?, ?)',
      [name, lab_id]
    );

    res.status(201).json({ message: 'Category created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const labId = req.lab_id;

    let query = 'UPDATE test_categories SET name = ? WHERE id = ?';
    const params = [name, req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found or you do not have permission to update it.' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = 'UPDATE test_categories SET is_active = FALSE WHERE id = ?';
    const params = [req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
