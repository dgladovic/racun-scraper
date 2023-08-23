const express = require('express');
const router = express.Router();


// Route to list all users
router.get('/', async (req, res) => {
  try {
    const usersCollection = admin.firestore().collection('users');
    const querySnapshot = await usersCollection.get();
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

router.delete('/all', async (req, res) => {
  try {
    const usersCollection = admin.firestore().collection('users');
    
    const querySnapshot = await usersCollection.get();
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting users' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const usersCollection = admin.firestore().collection('users');
    
    const userId = req.params.id;
    await usersCollection.doc(userId).delete();

    res.status(200).json({ message: `User with user_id ${userId} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;
