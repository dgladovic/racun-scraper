const express = require('express');
const router = express.Router();
const axios = require('axios');
const parser = require('./parser');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

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
  console.log("Connected psql");
});

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

    const client = await pool.connect();

    const checkQuery = 'SELECT COUNT(*) FROM receipts WHERE receipt_number = $1';
    const { rows } = await client.query(checkQuery, [receiptNumber]);
    const existingCount = parseInt(rows[0].count, 10);

    if (existingCount > 0) {
      client.release();
      return res.status(400).json({ error: 'Receipt with the same receipt_number already exists' });
    }

    const insertQuery = `
  INSERT INTO receipts (receipt_number, user_id, name, tax_name, address, location, items, receipt_amount, receipt_tax, time_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`;

    await client.query(insertQuery, [
      receiptNumber,
      userId,
      name,
      taxName,
      address,
      location,
      JSON.stringify(items),
      receiptAmount,
      receiptTax,
      timeDate
    ]);

    client.release();

    res.json({ message: 'Receipt saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving receipt' });
  }
});

router.get('/:id', (req, res) => {
  try {
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
