const express = require('express');
const app = express();
const port = 4800;

const receiptsRouter = require('./receipts');
app.use('/receipts', receiptsRouter);

const scanRouter = require('./scan');
app.use('/scan', scanRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})