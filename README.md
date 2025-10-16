# iLab - Laboratory Management System

A complete full-stack Laboratory Management System built with Node.js, Angular 16, MySQL, and Bootstrap 5.

## Features

### Core Modules
- **Dashboard** - Real-time statistics, recent orders, revenue tracking, and top tests analytics
- **Patient Management** - Complete patient records with medical history
- **Doctor Management** - Referring doctor database with specializations
- **Test Catalog** - Comprehensive test management with categories, pricing, and specifications
- **Order Management** - Test order creation, tracking, and status management
- **Test Results** - Result entry, verification, and status tracking
- **Payment Processing** - Multiple payment methods, partial payments, and payment history
- **User Authentication** - Role-based access control (Admin, Lab Technician, Receptionist, Doctor)

### Additional Features
- Advanced search and filtering
- Real-time order status updates
- Payment tracking and invoicing
- Test result management with normal/abnormal/critical status
- Priority handling (Normal, Urgent, STAT)
- Discount management
- Comprehensive reporting

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- RESTful API architecture

### Frontend
- **Angular 16**
- **Bootstrap 5** for UI
- **Bootstrap Icons**
- Reactive Forms
- HTTP Interceptors for authentication

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lab_management
DB_PORT=3306
JWT_SECRET=your_secret_key
PORT=3000
```

4. Create database and import schema:
```bash
mysql -u root -p
```
Then run:
```sql
source config/schema.sql
```

Or manually:
```bash
mysql -u root -p < config/schema.sql
```

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL if needed in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

4. Start the Angular development server:
```bash
npm start
```

Frontend will run on `http://localhost:4200`

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

**Important:** Change the default password after first login in production!

## Database Schema

The system includes the following main tables:
- `users` - System users with role-based access
- `patients` - Patient records
- `doctors` - Referring doctors
- `test_categories` - Test categorization
- `tests` - Test catalog
- `patient_test_orders` - Test orders
- `patient_test_order_items` - Order line items
- `test_results` - Test results and findings
- `payments` - Payment transactions
- `reports` - Generated reports

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/profile` - Get user profile

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Tests
- `GET /api/tests` - List all tests
- `GET /api/tests/:id` - Get test details
- `GET /api/test-categories` - List test categories
- `POST /api/tests` - Create new test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/payments` - Add payment

### Results
- `POST /api/results` - Add test result
- `PUT /api/results/:id` - Update test result
- `PUT /api/results/:id/verify` - Verify test result
- `GET /api/results/order/:orderId` - Get results by order

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## User Roles & Permissions

### Admin
- Full system access
- User management
- All CRUD operations

### Lab Technician
- Add and update test results
- Verify results
- View orders and patients

### Receptionist
- Create and manage orders
- Patient registration
- Payment processing
- Doctor management

### Doctor
- View orders and results
- Patient information access

## Project Structure

```
lab-management/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── testController.js
│   │   ├── orderController.js
│   │   ├── resultController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   └── index.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── login/
    │   │   │   ├── layout/
    │   │   │   ├── dashboard/
    │   │   │   ├── patients/
    │   │   │   ├── doctors/
    │   │   │   ├── tests/
    │   │   │   ├── orders/
    │   │   │   ├── new-order/
    │   │   │   └── order-detail/
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   └── api.service.ts
    │   │   ├── guards/
    │   │   │   └── auth.guard.ts
    │   │   ├── interceptors/
    │   │   │   └── auth.interceptor.ts
    │   │   ├── app.module.ts
    │   │   ├── app-routing.module.ts
    │   │   └── app.component.ts
    │   ├── environments/
    │   │   └── environment.ts
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.css
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

## Development Workflow

1. **Create Patient** - Register patient with complete details
2. **Create Order** - Select patient, add tests, set priority
3. **Collect Sample** - Update order status to "Sample Collected"
4. **Add Results** - Lab technician enters test results
5. **Verify Results** - Senior technician verifies results
6. **Complete Order** - Mark order as completed
7. **Process Payment** - Record payments (full or partial)
8. **Generate Report** - System generates test reports

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- HTTP-only authentication tokens
- Protected API routes
- Input validation

## Future Enhancements

- PDF report generation
- Email notifications
- SMS alerts for test results
- Barcode/QR code for sample tracking
- Advanced analytics and reporting
- Inventory management
- Equipment tracking
- Integration with lab instruments
- Mobile application

## Troubleshooting

### Backend Issues

**Database connection error:**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

**Port already in use:**
- Change PORT in `.env` file
- Kill process using the port

### Frontend Issues

**Cannot connect to API:**
- Verify backend is running
- Check API URL in `environment.ts`
- Check CORS settings

**Module not found:**
- Run `npm install` again
- Clear node_modules and reinstall

## Support

For issues and questions, please check:
1. Database schema is properly imported
2. All dependencies are installed
3. Environment variables are correctly set
4. Both backend and frontend servers are running

## License

This project is created for educational and commercial use.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ for efficient laboratory management**
