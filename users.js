const express = require('express');
const router = express.Router();

// Route to list all users
router.get('/', async (req, res) => {
  try {
    const client = await req.pool.connect();
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
      const client = await req.pool.connect();
      await client.query('DELETE FROM users');
      client.release();
      res.status(200).json({ message: 'All users deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting users' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const client = await req.pool.connect();
      const result = await client.query('DELETE FROM users WHERE user_id = $1',[req.params.id]);
      client.release();
      res.status(200).json({ message: `User with user_id ${req.params.id} deleted successfuly` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  });

module.exports = router;