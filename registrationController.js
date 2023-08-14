const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

// Replace this with your actual secret key
const secretKey = 'your-secret-key';

// Create a PostgreSQL connection pool
const pool = new Pool({
    user: 'scrapingbaza_user',
    host: 'dpg-cjad83ee546c738chkv0-a.frankfurt-postgres.render.com',
    database: 'scrapingbaza',
    password: '7sB3jE0dmRriRZhXJjKTC9LhvbNRYXF0',
    port: 5432,
    ssl: {
      rejectUnauthorized: false // This option is used to bypass SSL certificate validation (use with caution)
    }
  });
  pool.connect(function (err) {
    if (err) throw err;
    console.log("Connected psql-registration");
  });

router.use(bodyParser.json());

// Route to register a new user
router.post('/', async (req, res) => {
    console.log(req,'cao');
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const client = await pool.connect();
    const checkQuery = 'SELECT COUNT(*) FROM users WHERE email = $1';
    const { rows } = await client.query(checkQuery, [username]);
    const existingCount = parseInt(rows[0].count, 10);

    if (existingCount > 0) {
      client.release();
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash the password before storing it in the database
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: 'Registration failed' });
      }

      // Add the new user to the database
      const insertQuery = `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING user_id
      `;
      
      const result = await client.query(insertQuery, [username, hash]);
      const newUser = { id: result.rows[0]['user_id'], username };

      // Create and send a JWT token for the registered user
    //   const token = jwt.sign({ userId: newUser.id }, secretKey, { expiresIn: '1h' });

      client.release();
      res.status(201).json({ 'success': `New user ${newUser.username} created!` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
