const db = require('../config/database');
exports.getAllDoctors = async (req, res) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM doctors WHERE is_active = TRUE';
    let params = [];

    if (search) {
      query += ' AND (name LIKE ? OR specialization LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC';

    const [doctors] = await db.query(query, params);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getDoctorById = async (req, res) => {
  try {
    const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);

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

    const [result] = await db.query(
      'INSERT INTO doctors (name, specialization, phone, email, address, license_number) VALUES (?, ?, ?, ?, ?, ?)',
      [name, specialization, phone, email, address, license_number]
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
      'UPDATE doctors SET name = ?, specialization = ?, phone = ?, email = ?, address = ?, license_number = ? WHERE id = ?',
      [name, specialization, phone, email, address, license_number, req.params.id]
    );

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteDoctor = async (req, res) => {
  try {
    await db.query('UPDATE doctors SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
