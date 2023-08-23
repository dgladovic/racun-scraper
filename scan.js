const express = require('express');
const router = express.Router();
const axios = require('axios');
const parser = require('./parser');
const cors = require('cors');
const bodyParser = require('body-parser');


router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.use(cors({
  origin: '*'
}));

router.use(bodyParser.json());

router.post('/save', async (req, res) => {
  try {
    const {
      receiptNumber,
      taxNumber,
      userId,
      name,
      taxName,
      address,
      location,
      items,
      receiptAmount,
      receiptTax,
      timeDate
    } = req.body;

    console.log(req.body);

    const db = req.admin.firestore();
    const receiptsCollection = db.collection('receipts');

    const snapshot = await receiptsCollection.where('receipt_number', '==', receiptNumber).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'Receipt with the same receipt_number already exists' });
    }

    const newReceipt = {
      receipt_number: receiptNumber,
      tax_number: taxNumber,
      user_id: userId,
      name: name,
      tax_name: taxName,
      address: address,
      location: location,
      items: items,
      receipt_amount: receiptAmount,
      receipt_tax: receiptTax,
      time_date: timeDate
    };

    await receiptsCollection.add(newReceipt);

    res.json({ message: 'Receipt saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving receipt' });
  }
});

router.get('/:id', (req, res) => {
  try {
    console.log('parsing-receipt');
    // ako se bude menjala ruta, u skladu sa tim menjati i paramtera u slice 
    const url = req.url.slice(3);
    axios.get(url).then((el) => {
      const hey = parser.parseData(el);
      res.send(hey);
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error scanning receipt' });
  }
});

module.exports = router;
