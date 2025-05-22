const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all semesters
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM semesters ORDER BY start_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching semesters' });
    }
});

// Create a new semester
router.post('/', async (req, res) => {
    const { semesterName, startDate, endDate, isActive } = req.body;
    try {
        // If this is set as active, deactivate all other semesters
        if (isActive) {
            await pool.query('UPDATE semesters SET is_active = false');
        }

        const result = await pool.query(
            'INSERT INTO semesters (semester_name, start_date, end_date, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
            [semesterName, startDate, endDate, isActive]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique violation
            res.status(400).json({ message: 'Semester name already exists' });
        } else {
            res.status(500).json({ message: 'Error creating semester' });
        }
    }
});

// Update a semester
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { semesterName, startDate, endDate, isActive } = req.body;
    try {
        // If this is set as active, deactivate all other semesters
        if (isActive) {
            await pool.query('UPDATE semesters SET is_active = false WHERE id != $1', [id]);
        }

        const result = await pool.query(
            'UPDATE semesters SET semester_name = $1, start_date = $2, end_date = $3, is_active = $4 WHERE id = $5 RETURNING *',
            [semesterName, startDate, endDate, isActive, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Semester not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique violation
            res.status(400).json({ message: 'Semester name already exists' });
        } else {
            res.status(500).json({ message: 'Error updating semester' });
        }
    }
});

// Delete a semester
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM semesters WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Semester not found' });
        } else {
            res.json({ message: 'Semester deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting semester' });
    }
});

module.exports = router; 