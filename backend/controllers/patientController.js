const db = require('../config/database');

exports.getAllPatientsForDropdown = async (req, res) => {
  try {
    const [patients] = await db.query('SELECT id, name, patient_code FROM patients WHERE is_active = TRUE AND lab_id = ? ORDER BY name ASC', [req.lab_id]);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM patients WHERE is_active = TRUE AND lab_id = ?';
    let params = [req.lab_id];

    if (search) {
      query += ' AND (name LIKE ? OR patient_code LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (dateFrom) {
      query += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [patients] = await db.query(query, params);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM patients WHERE is_active = TRUE AND lab_id = ?', [req.lab_id]
    );

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
    const [patients] = await db.query('SELECT * FROM patients WHERE id = ? AND lab_id = ?', [req.params.id, req.lab_id]);

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
    const lab_id = req.lab_id;

    // Generate patient code
    const [lastPatient] = await db.query('SELECT patient_code FROM patients WHERE lab_id = ? ORDER BY id DESC LIMIT 1', [lab_id]);
    let patientCode = 'PAT0001';
    if (lastPatient && lastPatient.length > 0 && lastPatient[0].patient_code) {
        try {
            const lastCode = parseInt(lastPatient[0].patient_code.replace('PAT', ''));
            if (!isNaN(lastCode)) {
                patientCode = 'PAT' + String(lastCode + 1).padStart(4, '0');
            }
        } catch (e) {
            // Fallback in case of parsing error
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
    const lab_id = req.lab_id;

    await db.query(
      `UPDATE patients SET name = ?, date_of_birth = ?, age = ?, gender = ?, phone = ?, email = ?, 
       address = ?, blood_group = ?, emergency_contact = ?, medical_history = ? WHERE id = ? AND lab_id = ?`,
      [name, date_of_birth, age, gender, phone, email, address, blood_group, emergency_contact, medical_history, req.params.id, lab_id]
    );

    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await db.query('UPDATE patients SET is_active = FALSE WHERE id = ? AND lab_id = ?', [req.params.id, req.lab_id]);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};