const { addAdministrator } = require('../models/adminModel');

// Controller to handle adding a new administrator
async function addAdmin(req, res) {
    try {
        const { first_name, last_name, email, password } = req.body;
        await addAdministrator(first_name, last_name, email, password);
        res.status(201).json({ message: 'Administrator added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { addAdmin };