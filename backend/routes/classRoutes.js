const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all classes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classes ORDER BY class_name');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching classes' });
    }
});

// Create a new class
router.post('/', async (req, res) => {
    const { className } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO classes (class_name) VALUES ($1) RETURNING *',
            [className]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique violation
            res.status(400).json({ message: 'Class name already exists' });
        } else {
            res.status(500).json({ message: 'Error creating class' });
        }
    }
});

// Update a class
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { className } = req.body;
    try {
        const result = await pool.query(
            'UPDATE classes SET class_name = $1 WHERE id = $2 RETURNING *',
            [className, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Class not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique violation
            res.status(400).json({ message: 'Class name already exists' });
        } else {
            res.status(500).json({ message: 'Error updating class' });
        }
    }
});

// Delete a class
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Class not found' });
        } else {
            res.json({ message: 'Class deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting class' });
    }
});

module.exports = router; 