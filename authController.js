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
    console.log("Connected psql-auth");
  });

router.use(bodyParser.json());

// Route to authenticate a user
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Username and Password are required!' });

    const client = await pool.connect();
    const query = 'SELECT email, password FROM users WHERE email = $1';
    const result = await client.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      client.release();
      return res.status(401).json({ message: 'Authentication failed - unauthorized.' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      client.release();
      if (err || !result) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Create and send a JWT token
    //   const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.status(201).json({ 'success': `Login successfull!` });
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
