const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Function to add a new administrator
async function addAdministrator(first_name, last_name, email, password) {
    const hashedPassword = await require('bcryptjs').hash(password, 10);
    const query = 'INSERT INTO administrators (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)';
    const values = [first_name, last_name, email, hashedPassword];
    await pool.query(query, values);
}

module.exports = { addAdministrator };