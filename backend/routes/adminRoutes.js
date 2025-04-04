const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Register administrator route
router.post('/register', adminController.registerAdmin);

module.exports = router;