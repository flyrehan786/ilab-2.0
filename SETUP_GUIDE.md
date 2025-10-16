# Quick Setup Guide - iLab (Laboratory Management System)

## ⚡ Quick Install (Use Batch Files)

**For Windows users, simply:**
1. Double-click `install-all.bat` to install all dependencies
2. Import database (see Step 2 below)
3. Double-click `start-backend.bat` to start backend
4. Double-click `start-frontend.bat` to start frontend

---

## Step-by-Step Installation

### Step 1: Install Prerequisites

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Version: 16.x or higher
   - Verify: `node --version` and `npm --version`

2. **Install MySQL**
   - Download from: https://dev.mysql.com/downloads/
   - Version: 8.x or higher
   - Remember your root password!

### Step 2: Setup Database

1. Open MySQL Command Line or MySQL Workbench

2. Run these commands:
```sql
CREATE DATABASE lab_management;
USE lab_management;
```

3. Import the schema:
   - Option A: Using command line
   ```bash
   mysql -u root -p lab_management < backend/config/schema.sql
   ```
   
   - Option B: Copy and paste the contents of `backend/config/schema.sql` into MySQL Workbench and execute

4. Verify tables are created:
```sql
SHOW TABLES;
```
You should see 11 tables.

### Step 3: Setup Backend

1. Open terminal/command prompt

2. Navigate to backend folder:
```bash
cd backend
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file (copy from `.env.example`):
```bash
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

5. Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=lab_management
DB_PORT=3306
JWT_SECRET=lab_management_secret_key_2024
PORT=3000
```

6. Start the backend:
```bash
npm start
```

You should see: "Server is running on port 3000"

### Step 4: Setup Frontend

1. Open a NEW terminal/command prompt

2. Navigate to frontend folder:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

This may take 5-10 minutes.

4. Start the frontend:
```bash
npm start
```

You should see: "Compiled successfully"

### Step 5: Access the Application

1. Open your browser

2. Go to: `http://localhost:4200`

3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`

## Verification Checklist

- [ ] MySQL is running
- [ ] Database `lab_management` exists with 11 tables
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 4200
- [ ] Can access login page
- [ ] Can login successfully
- [ ] Dashboard loads with statistics

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"
**Solution:**
- Check MySQL is running
- Verify credentials in `.env` file
- Test MySQL connection: `mysql -u root -p`

### Issue 2: "Port 3000 already in use"
**Solution:**
- Change PORT in `.env` to 3001
- Update `apiUrl` in `frontend/src/environments/environment.ts`

### Issue 3: "npm install fails"
**Solution:**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder
- Run `npm install` again

### Issue 4: "Cannot GET /api/..."
**Solution:**
- Ensure backend is running
- Check backend console for errors
- Verify database connection

### Issue 5: Angular compilation errors
**Solution:**
- Ensure Node.js version is 16.x or higher
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Testing the Application

### 1. Create a Patient
- Go to Patients menu
- Click "Add Patient"
- Fill in details and save

### 2. Create a Test Order
- Go to Orders menu
- Click "New Order"
- Select patient
- Add tests
- Create order

### 3. Add Test Results
- Go to Orders menu
- Click on an order
- Click "Add" button for a test
- Enter result values
- Save

### 4. Process Payment
- In order detail page
- Click "Add Payment"
- Enter amount and payment method
- Submit

## Default Data

The system comes with pre-loaded data:

**Users:**
- admin / admin123 (Admin role)

**Test Categories:**
- Hematology
- Biochemistry
- Microbiology
- Immunology
- Pathology

**Sample Tests:**
- Complete Blood Count (CBC)
- Fasting Blood Sugar
- Liver Function Test
- Kidney Function Test
- Lipid Profile
- TSH
- HbA1c
- Urine Routine

## Next Steps

1. **Change Default Password**
   - Login as admin
   - Go to profile
   - Change password

2. **Add More Users**
   - Create users for lab technicians
   - Create users for receptionists

3. **Add Doctors**
   - Go to Doctors menu
   - Add referring doctors

4. **Configure Tests**
   - Review test catalog
   - Update prices
   - Add more tests as needed

5. **Start Using**
   - Register patients
   - Create orders
   - Process tests
   - Generate reports

## Production Deployment

For production deployment:

1. **Backend:**
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Use production database
   - Set up proper logging

2. **Frontend:**
   - Build: `ng build --configuration production`
   - Deploy `dist` folder to web server
   - Update API URL in environment.prod.ts

3. **Database:**
   - Regular backups
   - Optimize indexes
   - Monitor performance

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all services are running
3. Check database connectivity
4. Review the README.md for detailed documentation

---

**Congratulations! Your Laboratory Management System is ready to use! 🎉**
