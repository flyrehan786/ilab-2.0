const db = require('../config/database');

exports.getAllPatientsForDropdown = async (req, res) => {
  try {
    const labId = req.query.lab_id || req.lab_id;
    let query = 'SELECT id, name, patient_code FROM patients WHERE is_active = TRUE';
    const params = [];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    query += ' ORDER BY name ASC';

    const [patients] = await db.query(query, params);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, dateFrom, dateTo } = req.query;
    const labId = req.query.lab_id || req.lab_id;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.is_active = TRUE';
    let params = [];

    if (labId && labId !== '') {
      whereClause += ' AND p.lab_id = ?';
      params.push(labId);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.patient_code LIKE ? OR p.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (dateFrom) {
      whereClause += ' AND DATE(p.created_at) >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClause += ' AND DATE(p.created_at) <= ?';
      params.push(dateTo);
    }

    const dataQuery = `SELECT p.*, l.name as lab_name FROM patients p JOIN labs l ON p.lab_id = l.id ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    const [patients] = await db.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    const countQuery = `SELECT COUNT(*) as total FROM patients p ${whereClause}`;
    const [countResult] = await db.query(countQuery, params);

    res.json({
      data: patients,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = 'SELECT * FROM patients WHERE id = ?';
    const params = [req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [patients] = await db.query(query, params);

    if (patients.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patients[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { name, date_of_birth, age, gender, phone, email, address, blood_group, emergency_contact, medical_history } = req.body;
    const lab_id = req.body.lab_id || req.lab_id;

    if (!lab_id) {
      return res.status(400).json({ error: 'Lab ID is required' });
    }

    // Generate patient code
    const [lastPatient] = await db.query('SELECT patient_code FROM patients WHERE lab_id = ? ORDER BY id DESC LIMIT 1', [lab_id]);
    let patientCode = 'PAT0001';
    if (lastPatient.length > 0 && lastPatient[0].patient_code) {
      try {
        const lastCode = parseInt(lastPatient[0].patient_code.replace('PAT', ''));
        if (!isNaN(lastCode)) {
          patientCode = 'PAT' + String(lastCode + 1).padStart(4, '0');
        }
      } catch (e) {
        console.error('Error parsing patient code:', e);
      }
    }

    const [result] = await db.query(
      `INSERT INTO patients (patient_code, name, date_of_birth, age, gender, phone, email, address, blood_group, emergency_contact, medical_history, lab_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientCode, name, date_of_birth, age, gender, phone, email, address, blood_group, emergency_contact, medical_history, lab_id]
    );

    res.status(201).json({ message: 'Patient created successfully', id: result.insertId, patient_code: patientCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { name, date_of_birth, age, gender, phone, email, address, blood_group, emergency_contact, medical_history } = req.body;
    const labId = req.lab_id;

    let query = `UPDATE patients SET name = ?, date_of_birth = ?, age = ?, gender = ?, phone = ?, email = ?, 
                 address = ?, blood_group = ?, emergency_contact = ?, medical_history = ? WHERE id = ?`;
    const params = [name, date_of_birth, age, gender, phone, email, address, blood_group, emergency_contact, medical_history, req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Patient not found or you do not have permission to update it.' });
    }

    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const labId = req.lab_id;
    let query = 'UPDATE patients SET is_active = FALSE WHERE id = ?';
    const params = [req.params.id];

    if (labId) {
      query += ' AND lab_id = ?';
      params.push(labId);
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Patient not found or you do not have permission to delete it.' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};