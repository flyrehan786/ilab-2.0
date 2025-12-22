const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const patientController = require('../controllers/patientController');
const doctorController = require('../controllers/doctorController');
const testController = require('../controllers/testController');
const orderController = require('../controllers/orderController');
const resultController = require('../controllers/resultController');
const dashboardController = require('../controllers/dashboardController');
const userController = require('../controllers/userController');

// Auth routes
router.post('/auth/register-lab', authController.registerLab);
router.post('/auth/login', authController.login);
router.get('/auth/profile', auth, authController.getProfile);

// Patient routes
router.get('/patients', auth, patientController.getAllPatients);
router.get('/patients/:id', auth, patientController.getPatientById);
router.post('/patients', auth, patientController.createPatient);
router.put('/patients/:id', auth, patientController.updatePatient);
router.delete('/patients/:id', auth, authorize('admin'), patientController.deletePatient);

// Doctor routes
router.get('/doctors', auth, doctorController.getAllDoctors);
router.get('/doctors/:id', auth, doctorController.getDoctorById);
router.post('/doctors', auth, authorize('admin', 'receptionist'), doctorController.createDoctor);
router.put('/doctors/:id', auth, authorize('admin', 'receptionist'), doctorController.updateDoctor);
router.delete('/doctors/:id', auth, authorize('admin'), doctorController.deleteDoctor);

// Test routes
router.get('/tests', auth, testController.getAllTests);
router.get('/tests/:id', auth, testController.getTestById);
router.get('/test-categories', auth, testController.getAllCategories);
router.post('/tests', auth, authorize('admin'), testController.createTest);
router.put('/tests/:id', auth, authorize('admin'), testController.updateTest);
router.delete('/tests/:id', auth, authorize('admin'), testController.deleteTest);

// Order routes
router.get('/orders', auth, orderController.getAllOrders);
router.get('/orders/:id', auth, orderController.getOrderById);
router.post('/orders', auth, orderController.createOrder);
router.put('/orders/:id/status', auth, orderController.updateOrderStatus);
router.post('/payments', auth, orderController.addPayment);

// Result routes
router.post('/results', auth, authorize('admin', 'lab_technician'), resultController.addResult);
router.put('/results/:id', auth, authorize('admin', 'lab_technician'), resultController.updateResult);
router.put('/results/:id/verify', auth, authorize('admin', 'lab_technician'), resultController.verifyResult);
router.get('/results/order/:orderId', auth, resultController.getResultsByOrder);

// Dashboard routes
router.get('/dashboard/stats', auth, dashboardController.getDashboardStats);

// User Management routes (Admin only)
router.get('/users', auth, authorize('admin'), userController.getAllUsers);
router.get('/users/:id', auth, authorize('admin'), userController.getUserById);
router.post('/users', auth, authorize('admin'), userController.createUser);
router.put('/users/:id', auth, authorize('admin'), userController.updateUser);
router.delete('/users/:id', auth, authorize('admin'), userController.deleteUser);
router.delete('/users/:id/permanent', auth, authorize('admin'), userController.permanentDeleteUser);
router.patch('/users/:id/toggle-status', auth, authorize('admin'), userController.toggleUserStatus);
router.post('/users/:id/change-password', auth, userController.changePassword);

module.exports = router;
