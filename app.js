const express = require('express');
const app = express();
const { Pool } = require('pg');
const port = process.env.PORT || 4800;

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

const receiptsRouter = require('./receipts');
app.use('/receipts', receiptsRouter);

const scanRouter = require('./scan');
app.use('/scan', scanRouter);

app.use('/register',require('./registrationController'));
app.use('/login',require('./authController'));

const usersRouter = require('./users');
app.use('/users',usersRouter);

// Create a PostgreSQL connection pool
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
    console.log("Connected psql-users");
  });

  const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;