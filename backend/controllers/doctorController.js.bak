const db = require('../config/database');
exports.getAllDoctors = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let dataQuery = 'SELECT * FROM doctors WHERE is_active = TRUE AND lab_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM doctors WHERE is_active = TRUE AND lab_id = ?';
    let params = [req.lab_id];

    if (search) {
      const searchTerm = `%${search}%`;
      const searchQuery = ' AND (name LIKE ? OR specialization LIKE ?)';
      dataQuery += searchQuery;
      countQuery += searchQuery;
      params.push(searchTerm, searchTerm);
    }

    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    dataQuery += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [doctors] = await db.query(dataQuery, params);

    res.json({
      data: doctors,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getDoctorById = async (req, res) => {
  try {
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ? AND lab_id = ?', [req.params.id, req.lab_id]);

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctors[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createDoctor = async (req, res) => {
  try {
    const { name, specialization, phone, email, address, license_number } = req.body;
    const lab_id = req.lab_id;

    const [result] = await db.query(
      'INSERT INTO doctors (name, specialization, phone, email, address, license_number, lab_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, specialization, phone, email, address, license_number, lab_id]
    );

    res.status(201).json({ message: 'Doctor created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateDoctor = async (req, res) => {
  try {
    const { name, specialization, phone, email, address, license_number } = req.body;

    await db.query(
      'UPDATE doctors SET name = ?, specialization = ?, phone = ?, email = ?, address = ?, license_number = ? WHERE id = ? AND lab_id = ?',
      [name, specialization, phone, email, address, license_number, req.params.id, req.lab_id]
    );

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteDoctor = async (req, res) => {
  try {
    await db.query('UPDATE doctors SET is_active = FALSE WHERE id = ? AND lab_id = ?', [req.params.id, req.lab_id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
