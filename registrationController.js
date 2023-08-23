const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');


router.use(bodyParser.json());
router.use(cors({
  origin: '*'
}));

// Route to register a new user
router.post('/', async (req, res) => {
  try {
    console.log('registrate-app');
    let { email, password, first_name, last_name, date_of_birth } = req.body;
    if (date_of_birth === '') {
      date_of_birth = new Date();
    }
    const emailConv = email.toLowerCase();
    console.log(req.body);

    const usersRef = req.admin.firestore().collection('users');
    const userRecord = await usersRef.where('email', '==', emailConv).get();
    console.log(userRecord);

    if (!userRecord.empty) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: 'Registration failed' });
      }
      const newUser = {
        email: emailConv,
        first_name: first_name,
        last_name: last_name,
        password: hash,
        date_of_birth: date_of_birth
      };
      const newUserRef = await usersRef.add(newUser);
      res.status(201).json({ 'success': `New user ${newUserRef.email} created!`, id: newUserRef.id });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;