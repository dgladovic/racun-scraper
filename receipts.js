const express = require('express');
const router = express.Router();
const axios = require('axios');
const parser = require('./parser');
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

router.get('/totalpurchases/:userId', async (req, res) => {
  try {
    console.log('get-total-amount');
    const userId = req.params.userId;

    const receiptsRef = req.admin.firestore().collection('receipts'); // Using req.admin here
    const querySnapshot = await receiptsRef.where('user_id', '==', userId).get();

    let totalAmount = 0;
    querySnapshot.forEach((doc) => {
      totalAmount += doc.data().receipt_amount;
    });

    const response = convertToCamelCase({ total_amount: Math.round(totalAmount*100)/100 });
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving total amount by user' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    console.log('get-all-receipts');
    const userId = req.params.userId;

    const receiptsRef = req.admin.firestore().collection('receipts'); // Using req.admin here
    const querySnapshot = await receiptsRef.where('user_id', '==', userId).get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'No purchases found' });
    }

    const convertedReceipts = [];
    querySnapshot.forEach((doc) => {
      const receiptData = doc.data();
      convertedReceipts.push(convertToCamelCase(receiptData));
    });

    res.status(200).json(convertedReceipts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving receipts by user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const receiptId = req.params.id;

    const receiptsRef = req.admin.firestore().collection('receipts').doc(receiptId); // Using req.admin here
    await receiptRef.delete();

    res.status(200).json({ message: `Receipt with id ${receiptId} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting receipt' });
  }
});

module.exports = router;
