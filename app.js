const express = require('express');
const app = express();
const port = process.env.PORT || 4800;

const admin = require('firebase-admin');
const firebaseKey = process.env.FIREBASE_KEY;

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey)
});


app.use((req, res, next) => {
    req.admin = admin;
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

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;