exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        console.log('Checking if username or email already exists...');
        const checkQuery = 'SELECT * FROM administrators WHERE username = $1 OR email = $2';
        const checkResult = await pool.query(checkQuery, [username, email]);

        if (checkResult.rows.length > 0) {
            console.log('Username or email already exists.');
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        console.log('Hashing password...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log('Inserting new admin into the database...');
        const insertQuery = 'INSERT INTO administrators (username, email, password_hash) VALUES ($1, $2, $3)';
        await pool.query(insertQuery, [username, email, hashedPassword]);

        console.log('Admin registered successfully!');
        res.status(201).json({ message: 'Administrator registered successfully!' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};