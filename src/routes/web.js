import express from 'express';
import { showLoginPage, login, logout, showDashboard } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

// Import CRUD controllers
import * as userController from '../controllers/userController.js';
import * as agencyController from '../controllers/agencyController.js';
import * as contactController from '../controllers/contactController.js';
import * as contactTagController from '../controllers/contactTagController.js';
import * as subscriptionController from '../controllers/subscriptionController.js';
import * as userSubscriptionController from '../controllers/userSubscriptionController.js';

const router = express.Router();

// Public routes
router.get('/login', showLoginPage);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.get('/dashboard', verifyToken, showDashboard);

// User CRUD routes
router.get('/dashboard/users', verifyToken, userController.index);
router.get('/dashboard/users/create', verifyToken, userController.create);
router.post('/dashboard/users', verifyToken, userController.store);
router.get('/dashboard/users/:id', verifyToken, userController.show);
router.get('/dashboard/users/:id/edit', verifyToken, userController.edit);
router.post('/dashboard/users/:id', verifyToken, userController.update);
router.post('/dashboard/users/:id/delete', verifyToken, userController.destroy);

// Agency CRUD routes
router.get('/dashboard/agencies', verifyToken, agencyController.index);
router.get('/dashboard/agencies/create', verifyToken, agencyController.create);
router.post('/dashboard/agencies', verifyToken, agencyController.store);
router.get('/dashboard/agencies/:id', verifyToken, agencyController.show);
router.get('/dashboard/agencies/:id/edit', verifyToken, agencyController.edit);
router.post('/dashboard/agencies/:id', verifyToken, agencyController.update);
router.post('/dashboard/agencies/:id/delete', verifyToken, agencyController.destroy);

// Contact CRUD routes
router.get('/dashboard/contacts', verifyToken, contactController.index);
router.get('/dashboard/contacts/create', verifyToken, contactController.create);
router.post('/dashboard/contacts', verifyToken, contactController.store);
router.get('/dashboard/contacts/:id', verifyToken, contactController.show);
router.get('/dashboard/contacts/:id/edit', verifyToken, contactController.edit);
router.post('/dashboard/contacts/:id', verifyToken, contactController.update);
router.post('/dashboard/contacts/:id/delete', verifyToken, contactController.destroy);

// Contact Tag CRUD routes
router.get('/dashboard/contact-tags', verifyToken, contactTagController.index);
router.get('/dashboard/contact-tags/create', verifyToken, contactTagController.create);
router.post('/dashboard/contact-tags', verifyToken, contactTagController.store);
router.get('/dashboard/contact-tags/:id', verifyToken, contactTagController.show);
router.get('/dashboard/contact-tags/:id/edit', verifyToken, contactTagController.edit);
router.post('/dashboard/contact-tags/:id', verifyToken, contactTagController.update);
router.post('/dashboard/contact-tags/:id/delete', verifyToken, contactTagController.destroy);

// Subscription CRUD routes
router.get('/dashboard/subscriptions', verifyToken, subscriptionController.index);
router.get('/dashboard/subscriptions/create', verifyToken, subscriptionController.create);
router.post('/dashboard/subscriptions', verifyToken, subscriptionController.store);
router.get('/dashboard/subscriptions/:id', verifyToken, subscriptionController.show);
router.get('/dashboard/subscriptions/:id/edit', verifyToken, subscriptionController.edit);
router.post('/dashboard/subscriptions/:id', verifyToken, subscriptionController.update);
router.post('/dashboard/subscriptions/:id/delete', verifyToken, subscriptionController.destroy);

// User Subscription CRUD routes
router.get('/dashboard/user-subscriptions', verifyToken, userSubscriptionController.index);
router.get('/dashboard/user-subscriptions/create', verifyToken, userSubscriptionController.create);
router.post('/dashboard/user-subscriptions', verifyToken, userSubscriptionController.store);
router.get('/dashboard/user-subscriptions/:id', verifyToken, userSubscriptionController.show);
router.get('/dashboard/user-subscriptions/:id/edit', verifyToken, userSubscriptionController.edit);
router.post('/dashboard/user-subscriptions/:id', verifyToken, userSubscriptionController.update);
router.post('/dashboard/user-subscriptions/:id/delete', verifyToken, userSubscriptionController.destroy);

// Redirect root to dashboard if authenticated, otherwise to login
router.get('/', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

export default router; 