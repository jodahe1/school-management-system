const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM subjects ORDER BY subject_name';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM subjects WHERE subject_id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

module.exports = router; 