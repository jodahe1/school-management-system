// backend/controllers/adminController.js
const { createAdmin } = require('../models/adminModel');

const addAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newAdmin = await createAdmin(name, email, password);
        res.status(201).json({ message: 'Administrator added successfully', admin: newAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error: error.message });
    }
};

module.exports = { addAdmin };