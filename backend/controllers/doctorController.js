const db = require('../config/database');

exports.getAllDoctorsForDropdown = async (req, res) => {
  try {
    const labId = req.query.lab_id || req.lab_id;
    let query = 'SELECT id, name FROM doctors WHERE is_active = TRUE';
    const params = [];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    query += ' ORDER BY name ASC';

    const [doctors] = await db.query(query, params);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const labId = req.query.lab_id || req.lab_id;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE d.is_active = TRUE';
    let params = [];

    if (labId && labId !== '') {
      whereClause += ' AND d.lab_id = ?';
      params.push(labId);
    }

    if (search) {
      whereClause += ' AND (d.name LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const dataQuery = `SELECT d.*, l.name as lab_name FROM doctors d JOIN labs l ON d.lab_id = l.id ${whereClause} ORDER BY d.name ASC LIMIT ? OFFSET ?`;
    const [doctors] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    const countQuery = `SELECT COUNT(*) as total FROM doctors d ${whereClause}`;
    const [countResult] = await db.query(countQuery, params);

    res.json({
      data: doctors,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getDoctorById = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = 'SELECT * FROM doctors WHERE id = ?';
    const params = [req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [doctors] = await db.query(query, params);

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
    const lab_id = req.body.lab_id || req.lab_id;

    if (!lab_id) {
      return res.status(400).json({ error: 'Lab ID is required' });
    }

    const [result] = await db.query(
      'INSERT INTO doctors (name, specialization, phone, email, address, license_number, lab_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, specialization, phone, email, address, license_number, lab_id]
    );

    res.status(201).json({ message: 'Doctor created successfully', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateDoctor = async (req, res) => {
  try {
    const { name, specialization, phone, email, address, license_number } = req.body;
    const labId = req.lab_id;

    let query = 'UPDATE doctors SET name = ?, specialization = ?, phone = ?, email = ?, address = ?, license_number = ? WHERE id = ?';
    const params = [name, specialization, phone, email, address, license_number, req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Doctor not found or you do not have permission to update it.' });
    }

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteDoctor = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = 'UPDATE doctors SET is_active = FALSE WHERE id = ?';
    const params = [req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Doctor not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
