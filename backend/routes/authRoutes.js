// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Unified login endpoint
router.post('/login', authController.login);

// Get user profile
router.get('/profile/:user_id', authController.getUserProfile);

// Update user profile
router.put('/profile/:user_id', authController.updateUserProfile);

// Complete first-time setup
router.post('/setup/:user_id', authController.completeSetup);

// Get first-time login information
router.get('/first-time/:user_id', authController.getFirstTimeInfo);

module.exports = router; 