// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes'); // New student routes
require('dotenv').config();

// Enable CORS
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes); // Student routes
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});