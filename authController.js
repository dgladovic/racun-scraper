const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');


router.use(bodyParser.json());
router.use(cors({
  origin: '*'
}));

// Route to authenticate a user
router.post('/', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Username and Password are required!' });

    const emailConv = email.toLowerCase();
    const usersCollection = req.admin.firestore().collection('users');
    
    const querySnapshot = await usersCollection.where('email', '==', emailConv).get();
    if (querySnapshot.empty) {
      return res.status(401).json({ message: 'Authentication failed - unauthorized.' });
    }

    const user = querySnapshot.docs[0].data();
    console.log(querySnapshot.docs[0].id);

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Create and send a JWT token
      // const token = jwt.sign({ userId: user.user_id }, secretKey, { expiresIn: '1h' });
      res.status(201).json({ success: `Login successful!`, id: querySnapshot.docs[0].id });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
