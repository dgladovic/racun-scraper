const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

// Replace this with your actual secret key
const secretKey = 'your-secret-key';

router.use(bodyParser.json());
router.use(cors({
    origin: '*'
  }));

// Route to authenticate a user
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: 'Username and Password are required!' });

    const client = await req.pool.connect();
    const emailConv = email.toLowerCase();
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [emailConv]);
    const user = result.rows[0];

    console.log(user);

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
    res.status(201).json({ 'success': `Login successfull!`, id: user['user_id'] });
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
