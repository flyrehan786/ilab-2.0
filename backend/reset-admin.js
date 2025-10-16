// Reset Admin Password Script
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'lab_management'
    });

    console.log('Connected to database...');

    // Hash the password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Password hashed:', hashedPassword);

    // Check if admin user exists
    const [users] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length > 0) {
      // Update existing admin user
      await connection.query(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✅ Admin password updated successfully!');
    } else {
      // Insert new admin user
      await connection.query(
        `INSERT INTO users (username, email, password, role, full_name, phone) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin@lab.com', hashedPassword, 'admin', 'System Administrator', '1234567890']
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n✅ You can now login to the application!');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
