const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let query = `
      SELECT id, username, email, role, full_name, phone, is_active, created_at, updated_at 
      FROM users 
      WHERE 1=1
    `;
    let params = [];

    if (dateFrom) {
      query += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY created_at DESC';
    
    const [results] = await db.query(query, params);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, username, email, role, full_name, phone, is_active, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `;
    
    const [results] = await db.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  const { username, email, password, role, full_name, phone } = req.body;
  
  // Validation
  if (!username || !email || !password || !role || !full_name) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  
  try {
    // Check if username already exists
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    const [existing] = await db.query(checkQuery, [username, email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const insertQuery = `
      INSERT INTO users (username, email, password, role, full_name, phone, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    
    const [result] = await db.query(insertQuery, [username, email, hashedPassword, role, full_name, phone || null]);
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role, full_name, phone, is_active } = req.body;
  
  // Validation
  if (!username || !email || !role || !full_name) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  
  try {
    // Check if username/email already exists for other users
    const checkQuery = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?';
    const [existing] = await db.query(checkQuery, [username, email, id]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    let updateQuery;
    let params;
    
    // If password is provided, hash it and update
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, password = ?, role = ?, full_name = ?, phone = ?, is_active = ?
        WHERE id = ?
      `;
      params = [username, email, hashedPassword, role, full_name, phone || null, is_active ? 1 : 0, id];
    } else {
      // Update without changing password
      updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, role = ?, full_name = ?, phone = ?, is_active = ?
        WHERE id = ?
      `;
      params = [username, email, role, full_name, phone || null, is_active ? 1 : 0, id];
    }
    
    const [result] = await db.query(updateQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user (soft delete - deactivate)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the default admin user
    if (id === '1') {
      return res.status(400).json({ error: 'Cannot delete the default admin user' });
    }
    
    const query = 'UPDATE users SET is_active = 0 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User deactivated successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Permanently delete user
exports.permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the default admin user
    if (id === '1') {
      return res.status(400).json({ error: 'Cannot delete the default admin user' });
    }
    
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User permanently deleted'
    });
  } catch (err) {
    console.error('Error permanently deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deactivating the default admin user
    if (id === '1') {
      return res.status(400).json({ error: 'Cannot deactivate the default admin user' });
    }
    
    const query = 'UPDATE users SET is_active = NOT is_active WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User status updated successfully'
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  
  try {
    // Get current password hash
    const query = 'SELECT password FROM users WHERE id = ?';
    const [results] = await db.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, results[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    await db.query(updateQuery, [hashedPassword, id]);
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
