const express = require('express');
const router = express.Router();
const axios = require('axios');
const parser = require('./parser');
const cors = require('cors');
const bodyParser = require('body-parser');

const { Pool } = require('pg');

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

pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected psql-receipts");
});

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
    const userId = req.params.userId;

    const client = await pool.connect();
    const query = `
      SELECT SUM(receipt_amount) AS totalAmount
      FROM receipts
      WHERE user_id = $1
    `;

    const result = await client.query(query, [userId]);
    const totalAmount = result.rows[0].totalamount || 0;

    client.release();
    const response = convertToCamelCase({ total_amount: totalAmount });
    res.status(200).json({ totalAmount }); // Include 200 status code
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving total amount by user' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const client = await pool.connect();
    const query = `
      SELECT * FROM public.receipts
      WHERE user_id = $1
    `;

    const result = await client.query(query, [userId]);
    const receipts = result.rows;

    client.release();

    if (receipts.length === 0) {
      return res.status(404).json({ message: 'No purchases found' });
    }
    const convertedReceipts = receipts.map(convertToCamelCase);
    res.status(200).json(convertedReceipts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving receipts by user' });
  }
});

module.exports = router;