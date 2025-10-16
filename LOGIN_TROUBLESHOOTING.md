# Login Troubleshooting Guide - iLab

## 🔐 Default Credentials

**Username:** `admin`  
**Password:** `admin123`

---

## ❌ Issue: Invalid Credentials / 401 Error

If you're getting "Invalid credentials" or 401 status from the API, follow these solutions:

---

## 🔧 Solution 1: Reset Admin Password (Recommended)

### Option A: Using Node.js Script

1. **Open terminal in backend folder:**
   ```bash
   cd backend
   ```

2. **Run the reset script:**
   ```bash
   node reset-admin.js
   ```

3. **You should see:**
   ```
   ✅ Admin password updated successfully!
   
   📋 Login Credentials:
   Username: admin
   Password: admin123
   ```

4. **Try logging in again**

---

### Option B: Using SQL Script

1. **Open MySQL Workbench or command line:**
   ```bash
   mysql -u root -p
   ```

2. **Run the SQL script:**
   ```bash
   source backend/reset-admin.sql
   ```
   
   Or manually:
   ```bash
   mysql -u root -p lab_management < backend/reset-admin.sql
   ```

3. **Verify the user exists:**
   ```sql
   USE lab_management;
   SELECT * FROM users WHERE username = 'admin';
   ```

4. **Try logging in again**

---

## 🔧 Solution 2: Verify Database Setup

### Check if database exists:

```sql
SHOW DATABASES;
```

Look for `lab_management` in the list.

### Check if users table exists:

```sql
USE lab_management;
SHOW TABLES;
```

You should see `users` table.

### Check if admin user exists:

```sql
SELECT id, username, email, role, is_active FROM users WHERE username = 'admin';
```

**If no results:** The admin user doesn't exist. Use Solution 1 to create it.

---

## 🔧 Solution 3: Re-import Database Schema

If the database is corrupted or incomplete:

1. **Drop and recreate database:**
   ```sql
   DROP DATABASE IF EXISTS lab_management;
   CREATE DATABASE lab_management;
   ```

2. **Import schema:**
   ```bash
   mysql -u root -p lab_management < backend/config/schema.sql
   ```

3. **Verify admin user:**
   ```sql
   USE lab_management;
   SELECT * FROM users WHERE username = 'admin';
   ```

---

## 🔧 Solution 4: Check Backend Configuration

### Verify .env file:

Check `backend/.env` file has correct database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lab_management
DB_PORT=3306
JWT_SECRET=lab_management_secret_key_2024
PORT=3000
```

### Test database connection:

```bash
cd backend
node -e "const db = require('./config/database'); db.query('SELECT 1', (err, res) => { if(err) console.error('Error:', err); else console.log('✅ Database connected!'); process.exit(); });"
```

---

## 🔧 Solution 5: Check Backend Server

### Verify backend is running:

1. **Check if backend is running on port 3000:**
   ```bash
   curl http://localhost:3000/api/auth/login
   ```

2. **If not running, start it:**
   ```bash
   cd backend
   npm start
   ```

3. **You should see:**
   ```
   Server is running on port 3000
   Database connected successfully
   ```

---

## 🔧 Solution 6: Test API Directly

### Using curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@lab.com",
    "role": "admin",
    "full_name": "System Administrator"
  }
}
```

**If you get 401:**
- Password hash doesn't match
- User doesn't exist
- Database connection issue

---

## 🔧 Solution 7: Create Admin User Manually

If all else fails, create the admin user manually:

```sql
USE lab_management;

-- Delete existing admin if any
DELETE FROM users WHERE username = 'admin';

-- Insert new admin user
INSERT INTO users (username, email, password, role, full_name, phone, is_active) 
VALUES (
  'admin', 
  'admin@lab.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin', 
  'System Administrator', 
  '1234567890',
  1
);

-- Verify
SELECT * FROM users WHERE username = 'admin';
```

---

## 📋 Quick Checklist

Before trying to login, verify:

- [ ] MySQL is running
- [ ] Database `lab_management` exists
- [ ] Table `users` exists
- [ ] Admin user exists in users table
- [ ] Backend server is running (port 3000)
- [ ] Frontend is running (port 4200)
- [ ] No console errors in browser
- [ ] Network tab shows API call to `/api/auth/login`

---

## 🐛 Common Issues

### Issue 1: "Cannot connect to database"
**Solution:** Check MySQL is running and credentials in `.env` are correct

### Issue 2: "Table 'users' doesn't exist"
**Solution:** Import schema: `mysql -u root -p lab_management < backend/config/schema.sql`

### Issue 3: "404 Not Found"
**Solution:** Backend is not running. Start it with `npm start` in backend folder

### Issue 4: "CORS error"
**Solution:** Backend CORS is not configured. Check `server.js` has `app.use(cors())`

### Issue 5: "Network Error"
**Solution:** Check backend URL in `frontend/src/environments/environment.ts`

---

## 🔍 Debug Mode

### Enable detailed logging:

1. **Backend - Add to server.js:**
   ```javascript
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.path}`);
     next();
   });
   ```

2. **Check backend console** when you try to login

3. **Check browser console** (F12) for errors

---

## ✅ Verification Steps

After fixing the issue:

1. **Test login:**
   - Go to http://localhost:4200
   - Enter: admin / admin123
   - Click "Sign In"

2. **Should see:**
   - Dashboard loads
   - User name in top right
   - No console errors

3. **If successful:**
   - You're logged in!
   - All features should work

---

## 📞 Still Having Issues?

### Check these files:

1. **Backend logs:** Check terminal where backend is running
2. **Frontend console:** Press F12 in browser
3. **Network tab:** Check API calls and responses
4. **Database:** Verify data exists

### Collect this information:

- Backend console output
- Browser console errors
- Network tab screenshot
- Database user query result

---

## 🎯 Quick Fix Command

**Run this in backend folder to reset everything:**

```bash
# Reset admin password
node reset-admin.js

# Or use SQL
mysql -u root -p lab_management < reset-admin.sql
```

---

## ✅ Success!

Once you can login:
- Username: `admin`
- Password: `admin123`
- Role: Admin (full access)

**Remember to change the password after first login in production!**

---

## 🔐 Password Hash Information

The password `admin123` is hashed using bcrypt with 10 rounds:

```
$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

This hash is stored in the database and compared during login.

---

**Need more help? Check the backend console for detailed error messages!**
