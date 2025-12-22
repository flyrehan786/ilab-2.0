const db = require('../config/database');

exports.getAllCategoriesForDropdown = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT id, name FROM test_categories WHERE is_active = TRUE AND lab_id = ? ORDER BY name ASC', [req.lab_id]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let dataQuery = 'SELECT * FROM test_categories WHERE is_active = TRUE AND lab_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM test_categories WHERE is_active = TRUE AND lab_id = ?';
    const params = [req.lab_id];

    if (search) {
      const searchTerm = `%${search}%`;
      const searchQuery = ' AND name LIKE ?';
      dataQuery += searchQuery;
      countQuery += searchQuery;
      params.push(searchTerm);
    }

    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    dataQuery += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    const queryParams = [...params, parseInt(limit), parseInt(offset)];

    const [categories] = await db.query(dataQuery, queryParams);

    res.json({
      data: categories,
      total,
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
    const lab_id = req.lab_id;

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
    await db.query(
      'UPDATE test_categories SET name = ? WHERE id = ? AND lab_id = ?',
      [name, req.params.id, req.lab_id]
    );
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await db.query('UPDATE test_categories SET is_active = FALSE WHERE id = ? AND lab_id = ?', [req.params.id, req.lab_id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
