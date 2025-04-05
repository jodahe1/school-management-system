// backend/routes/adminRoutes.js
const express = require('express');
const { addAdmin } = require('../controllers/adminController');

const router = express.Router();

router.post('/add', addAdmin);

module.exports = router;