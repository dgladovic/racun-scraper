const express = require('express');
const app = express();
const port = 4800;
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const parser = require('./parser');

const { Pool } = require('pg')


const pool = new Pool({
  user: 'scrapingbaza_user',
  host: 'dpg-cjad83ee546c738chkv0-a.frankfurt-postgres.render.com',
  database: 'scrapingbaza',
  password: '7sB3jE0dmRriRZhXJjKTC9LhvbNRYXF0',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // This option is used to bypass SSL certificate validation (use with caution)
  }
})
pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected psql");
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: '*'
}));

app.use(bodyParser.json());

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

app.get('/scan/:id', (req,res) => {
  
      let url = req.url.slice(8,);
      axios.get(url).then( (el) =>{
          const hey = parser.parseData(el);
          res.send(hey);
      })
});

app.post('/scan/save', async (req, res) => {
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

app.get('/receipt/totalpurchases/:userId', async (req, res) => {
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

app.get('/receipts/:userId', async (req, res) => {
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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})