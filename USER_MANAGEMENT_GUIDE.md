# User Management Guide - iLab

## 🎉 New Feature: User Management

A complete user management system has been added to iLab, allowing administrators to create and manage application users with different roles and permissions.

---

## 🚀 Quick Access

**Navigation:** Click "Users" in the top navigation bar

**Access Level:** Admin only

**URL:** http://localhost:4200/users

---

## 👥 User Roles

### Available Roles:

1. **Administrator**
   - Full system access
   - Can manage all users
   - Can perform all operations
   - Access to all modules

2. **Lab Technician**
   - Add and edit test results
   - Verify results
   - View orders and patients
   - Limited administrative access

3. **Receptionist**
   - Create orders
   - Register patients
   - Process payments
   - Manage doctors
   - Order tracking

4. **Doctor**
   - View orders
   - View results
   - Patient information
   - Read-only access

---

## ✨ Features

### User List View
- ✅ View all application users
- ✅ Search by username, email, name, or role
- ✅ See user status (Active/Inactive)
- ✅ Role badges with color coding
- ✅ Created date tracking
- ✅ Quick action buttons

### Create New User
- ✅ Username (unique, required)
- ✅ Email (unique, required)
- ✅ Password (required, encrypted)
- ✅ Role selection
- ✅ Full name (required)
- ✅ Phone number (optional)
- ✅ Auto-active status

### Edit User
- ✅ Update all user information
- ✅ Change role
- ✅ Update contact details
- ✅ Optional password change
- ✅ Toggle active status

### User Actions
- ✅ Activate/Deactivate users
- ✅ Delete users (soft delete)
- ✅ Edit user details
- ✅ Protected default admin

---

## 📋 How to Use

### Creating a New User

1. **Navigate to Users:**
   - Click "Users" in the top navigation bar

2. **Click "Add User" button**

3. **Fill in the form:**
   - **Username:** Unique username for login
   - **Email:** Valid email address
   - **Password:** Strong password (will be encrypted)
   - **Role:** Select appropriate role
   - **Full Name:** User's complete name
   - **Phone:** Optional contact number

4. **Click "Create User"**

5. **User can now login** with the provided credentials

---

### Editing a User

1. **Find the user** in the list (use search if needed)

2. **Click the edit icon** (pencil button)

3. **Update information:**
   - Change any field except username
   - Leave password blank to keep current password
   - Enter new password to change it
   - Toggle active status

4. **Click "Update User"**

---

### Deactivating a User

**Method 1: Toggle Status**
1. Click the toggle icon (on/off button)
2. Confirm the action
3. User status changes immediately

**Method 2: Delete**
1. Click the delete icon (trash button)
2. Confirm the action
3. User is deactivated (soft delete)

**Note:** Deactivated users cannot login but data is preserved

---

### Activating a User

1. Find the inactive user (Status: Inactive)
2. Click the toggle icon
3. Confirm the action
4. User can now login again

---

## 🔐 Security Features

### Password Security
- ✅ Passwords are hashed using bcrypt (10 rounds)
- ✅ Never stored in plain text
- ✅ Cannot be retrieved, only reset
- ✅ Strong encryption

### Access Control
- ✅ Only admins can access user management
- ✅ Protected API endpoints
- ✅ JWT authentication required
- ✅ Role-based authorization

### Protected Actions
- ✅ Cannot delete default admin user (ID: 1)
- ✅ Cannot deactivate default admin
- ✅ Unique username validation
- ✅ Unique email validation

---

## 🎨 User Interface

### User List Table

| Column | Description |
|--------|-------------|
| **Username** | Login username with admin badge if default |
| **Full Name** | User's complete name |
| **Email** | Email address |
| **Role** | Color-coded role badge |
| **Phone** | Contact number or N/A |
| **Status** | Active (green) or Inactive (gray) |
| **Created** | Account creation date |
| **Actions** | Edit, Toggle, Delete buttons |

### Role Badge Colors

- **Administrator:** Red badge
- **Lab Technician:** Blue badge
- **Receptionist:** Cyan badge
- **Doctor:** Green badge

### Status Indicators

- **Active:** Green badge - User can login
- **Inactive:** Gray badge - User cannot login

---

## 🔧 API Endpoints

### Backend Routes (Admin Only)

```
GET    /api/users                    - Get all users
GET    /api/users/:id                - Get user by ID
POST   /api/users                    - Create new user
PUT    /api/users/:id                - Update user
DELETE /api/users/:id                - Deactivate user
PATCH  /api/users/:id/toggle-status  - Toggle active status
POST   /api/users/:id/change-password - Change password
```

### Request Examples

**Create User:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "lab_technician",
  "full_name": "John Doe",
  "phone": "1234567890"
}
```

**Update User:**
```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "",  // Leave blank to keep current
  "role": "receptionist",
  "full_name": "John Doe",
  "phone": "1234567890",
  "is_active": true
}
```

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'lab_technician', 'receptionist', 'doctor') NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 💡 Best Practices

### Creating Users

1. **Use descriptive usernames**
   - firstname.lastname format
   - Easy to remember
   - Professional

2. **Strong passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Not easily guessable

3. **Appropriate roles**
   - Assign based on job function
   - Principle of least privilege
   - Review regularly

4. **Complete information**
   - Fill all required fields
   - Add phone for contact
   - Use valid email

### Managing Users

1. **Regular audits**
   - Review user list monthly
   - Remove inactive users
   - Update roles as needed

2. **Security**
   - Deactivate users who leave
   - Don't share credentials
   - Change passwords regularly

3. **Documentation**
   - Keep track of user roles
   - Document access levels
   - Maintain contact info

---

## 🔍 Search Functionality

### Search by:
- Username
- Email
- Full name
- Role

### How to search:
1. Type in the search box
2. Results filter automatically
3. Clear search to see all users

---

## ⚠️ Important Notes

### Default Admin User

- **Username:** admin
- **Cannot be deleted**
- **Cannot be deactivated**
- **Protected by system**
- **Change password after first login**

### User Deactivation

- **Soft delete** - Data is preserved
- **User cannot login** when inactive
- **Can be reactivated** anytime
- **All data remains intact**

### Password Changes

- **In edit mode:** Leave blank to keep current
- **New users:** Password required
- **Encrypted immediately**
- **Cannot be retrieved**

---

## 🎯 Common Tasks

### Task 1: Add a Lab Technician

```
1. Click "Users" → "Add User"
2. Username: tech.john
3. Email: john@lab.com
4. Password: TechPass123
5. Role: Lab Technician
6. Full Name: John Smith
7. Phone: 1234567890
8. Click "Create User"
```

### Task 2: Change User Role

```
1. Find user in list
2. Click edit icon
3. Change role dropdown
4. Click "Update User"
```

### Task 3: Deactivate User

```
1. Find user in list
2. Click toggle icon (on/off)
3. Confirm action
4. User status changes to Inactive
```

### Task 4: Reset User Password

```
1. Find user in list
2. Click edit icon
3. Enter new password
4. Click "Update User"
5. Inform user of new password
```

---

## 📁 Files Created

### Backend:
- `backend/controllers/userController.js` - User management logic
- `backend/routes/index.js` - Updated with user routes

### Frontend:
- `frontend/src/app/components/users/users.component.ts` - Component logic
- `frontend/src/app/components/users/users.component.html` - UI template
- `frontend/src/app/components/users/users.component.css` - Styles
- `frontend/src/app/services/api.service.ts` - Updated with user APIs
- `frontend/src/app/app.module.ts` - Registered UsersComponent
- `frontend/src/app/app-routing.module.ts` - Added /users route
- `frontend/src/app/components/layout/layout.component.html` - Added Users menu

---

## ✅ Testing Checklist

- [ ] Navigate to Users page
- [ ] View all users
- [ ] Search for users
- [ ] Create new user
- [ ] Edit existing user
- [ ] Change user password
- [ ] Toggle user status
- [ ] Deactivate user
- [ ] Reactivate user
- [ ] Verify role badges
- [ ] Test with different roles
- [ ] Verify admin protection
- [ ] Check form validation
- [ ] Test search functionality

---

## 🚀 Quick Start

1. **Login as admin** (admin / admin123)
2. **Click "Users"** in navigation
3. **Click "Add User"** to create first user
4. **Fill the form** and submit
5. **New user can login** immediately

---

## 🎓 User Workflow

```
Admin Creates User
       ↓
User Receives Credentials
       ↓
User Logs In
       ↓
Access Based on Role
       ↓
Performs Assigned Tasks
       ↓
Admin Monitors Activity
       ↓
Admin Updates Role/Status as Needed
```

---

## 📞 Support

### Common Issues:

**Cannot access Users page:**
- Ensure you're logged in as admin
- Check role permissions
- Verify authentication

**Cannot create user:**
- Check all required fields
- Verify username is unique
- Verify email is unique
- Check password strength

**User cannot login:**
- Verify user is active
- Check credentials are correct
- Ensure password was set correctly

---

## ✨ Features Summary

✅ **Complete CRUD operations** for users
✅ **Role-based access control**
✅ **Password encryption** (bcrypt)
✅ **Search and filter** functionality
✅ **Active/Inactive status** management
✅ **Protected default admin** user
✅ **Responsive design**
✅ **Form validation**
✅ **Error handling**
✅ **Success notifications**

---

**User Management is now fully functional and ready to use!** 🎉

Create users, assign roles, and manage your team efficiently with iLab's User Management system.
