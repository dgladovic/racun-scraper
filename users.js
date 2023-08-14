const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

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
    console.log("Connected psql-users");
  });

// Route to list all users
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM users';
    const result = await client.query(query);
    const users = result.rows;
    client.release();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

router.delete('/all', async (req, res) => {
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM users');
      client.release();
      res.status(200).json({ message: 'All users deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting users' });
    }
  });

module.exports = router;