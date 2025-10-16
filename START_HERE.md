# 🚀 Quick Start Guide - iLab (Laboratory Management System)

## ⚡ Fast Setup (5 Minutes)

### Step 1: Database Setup (2 minutes)

1. **Start MySQL** and open MySQL Workbench or command line

2. **Run the schema file:**
   ```bash
   mysql -u root -p < backend/config/schema.sql
   ```
   
   Or manually:
   - Open `backend/config/schema.sql` in MySQL Workbench
   - Execute the entire script

3. **Verify:** You should see 11 tables created in `lab_management` database

### Step 2: Backend Setup (1 minute)

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure database:**
   - Edit `backend/.env` file
   - Update `DB_PASSWORD` with your MySQL password
   ```
   DB_PASSWORD=your_mysql_password_here
   ```

4. **Start backend:**
   ```bash
   npm start
   ```
   
   ✅ You should see: "Server is running on port 3000"

### Step 3: Frontend Setup (2 minutes)

1. **Open NEW terminal** and navigate to frontend:
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   This takes 2-3 minutes...

3. **Start frontend:**
   ```bash
   npm start
   ```
   
   ✅ You should see: "Compiled successfully"

### Step 4: Login & Use

1. **Open browser:** http://localhost:4200

2. **Login credentials:**
   - Username: `admin`
   - Password: `admin123`

3. **Start using the system!**

---

## ✨ What's Included

### Pre-loaded Data:
- ✅ Admin user account
- ✅ 5 Test categories
- ✅ 8 Sample tests (CBC, Blood Sugar, LFT, KFT, etc.)

### Features Ready to Use:
- ✅ Patient Management (Add, Edit, Delete, Search)
- ✅ Doctor Management
- ✅ Test Catalog Management
- ✅ Create Test Orders
- ✅ Add Test Results
- ✅ Payment Processing
- ✅ Dashboard Analytics
- ✅ Real-time Status Tracking

---

## 🎯 Quick Test Workflow

### 1. Add a Patient
- Go to **Patients** → Click **Add Patient**
- Fill required fields (Name, Age, Gender, Phone)
- Click **Create**
- ✅ Patient code auto-generated!

### 2. Create an Order
- Go to **Orders** → Click **New Order**
- Select patient
- Add tests (click + button)
- Click **Create Order**
- ✅ Order number auto-generated!

### 3. Add Test Results
- Go to **Orders** → Click on an order
- Click **Add** button for a test
- Enter result values
- Click **Save Result**
- ✅ Order status updates automatically!

### 4. Process Payment
- In order detail page
- Click **Add Payment**
- Enter amount and method
- Click **Add Payment**
- ✅ Payment status updates!

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if MySQL is running
# Verify .env file has correct password
# Check port 3000 is not in use
```

### Frontend won't start?
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Can't login?
```bash
# Verify database has admin user
mysql -u root -p
USE lab_management;
SELECT * FROM users;

# If no admin user, run schema.sql again
```

### Database connection error?
- Check MySQL is running
- Verify credentials in `.env`
- Test connection: `mysql -u root -p`

---

## 📱 System URLs

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

## 🎨 UI Features

- ✅ Modern Bootstrap 5 design
- ✅ Responsive layout
- ✅ Fixed sidebar navigation
- ✅ Loading spinners
- ✅ Success/Error alerts
- ✅ Form validation
- ✅ Modal dialogs
- ✅ Status badges
- ✅ Search functionality

---

## 🔐 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ HTTP interceptors

---

## 📊 Default Test Catalog

| Test Code | Test Name | Price | Category |
|-----------|-----------|-------|----------|
| CBC001 | Complete Blood Count | ₹500 | Hematology |
| GLU001 | Fasting Blood Sugar | ₹200 | Biochemistry |
| LFT001 | Liver Function Test | ₹800 | Biochemistry |
| KFT001 | Kidney Function Test | ₹700 | Biochemistry |
| LIPID001 | Lipid Profile | ₹600 | Biochemistry |
| TSH001 | Thyroid Stimulating Hormone | ₹400 | Immunology |
| HBA1C001 | HbA1c | ₹500 | Biochemistry |
| URINE001 | Urine Routine | ₹150 | Microbiology |

---

## 🎓 Next Steps

1. **Customize Tests:** Add your lab's test catalog
2. **Add Users:** Create accounts for staff
3. **Add Doctors:** Register referring doctors
4. **Configure Settings:** Update prices, categories
5. **Start Testing:** Create real orders!

---

## 💡 Tips

- Use **Search** to quickly find patients
- **Filter orders** by status
- Check **Dashboard** for daily stats
- **Priority orders** (Urgent/STAT) for emergencies
- Apply **discounts** when creating orders
- Track **partial payments**

---

## 📞 Support

Check the detailed documentation:
- `README.md` - Complete documentation
- `SETUP_GUIDE.md` - Detailed setup instructions

---

**🎉 You're all set! Start managing your laboratory efficiently!**
