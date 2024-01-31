const express = require('express');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');

function convertToCamelCase(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelCaseKey = key.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
      result[camelCaseKey] = obj[key];
    }
  }
  return result;
}

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.use(cors({
  origin: '*'
}));

router.use(bodyParser.json());

// POST a single transaction done by user
router.post('/', async (req, res) => {
  try {
    let { amount, category, subcategory, label, date, user_id } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ error: 'Amount and category are required.' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'User id is required.' });
    }

    if (!subcategory) {subcategory = '';}
    if (!label) {label = '';}

    const db = req.admin.firestore();
    const transactionsCollection = db.collection('transactions');

    const timeAdded = new Date(); // Get current date and time

    await transactionsCollection.add({
      amount,
      category,
      subcategory,
      label,
      date,
      user_id,
      time_added: timeAdded
    });

    res.status(201).json({ message: 'Transaction saved successfully.' });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'An error occurred while saving the transaction.' });
  }
});


// GET a single transaction by document id
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const db = req.admin.firestore();
    const transactionsCollection = db.collection('transactions');

    const transactionDoc = await transactionsCollection.doc(transactionId).get();
    if (!transactionDoc.exists) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const transactionData = transactionDoc.data();
    res.status(200).json(transactionData);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ error: 'An error occurred while getting the transaction.' });
  }
});

// GET all transactions for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    const category = req.query.category;
    const subcategory = req.query.subcategory;

    const db = req.admin.firestore();
    const transactionsCollection = db.collection('transactions');

    let query = transactionsCollection;

    if (userId) {
      query = query.where('user_id', '==', userId);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    if (subcategory) {
      query = query.where('subcategory', '==', subcategory);
    }

    const snapshot = await query.get();
    const transactions = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.time_added - a.time_added);

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'An error occurred while getting the transactions.' });
  }
});


module.exports = router;
