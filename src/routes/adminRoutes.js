const express = require('express');
const router = express.Router();
const { addAdmin } = require('../controllers/adminController');

// Route to add a new administrator
router.post('/', addAdmin);

module.exports = router;