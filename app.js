const express = require('express');
const fs = require('fs');
const app = express();
const port = 4800;
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const parser = require('./parser');
const Receipt = require('./models/Receipt.js');


mongoose.connect('mongodb://127.0.0.1:27017/LocalDevBaza', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: '*'
}));

app.use(bodyParser.json());


const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

// app.get('/', (req,res) => {

//     // let url = req.url.slice(8,);

//     // // res.send(parser.fulldata);
//     // axios.get(url).then( (el) =>{
//     //     const hey = parser.parseData(el);
//     //     res.send(hey);
//     //     // console.log(hey);
//     // })
//     // console.log(req.query,'tabla');

// });

app.get('/scan/:id', (req,res) => {

    let url = req.url.slice(8,);

    axios.get(url).then( (el) =>{
        const hey = parser.parseData(el);
        res.send(hey);
    })


});

app.post('/scan/save', async (req, res) => {
    try{
        const payload = req.body;
        const savedReceipt = await Receipt.create(payload);
        console.log('Saved purchase:', savedReceipt);
        res.status(201).json({ message: 'Purchase saved successfully', data: savedReceipt });
    }
    catch(error){
        console.error('Error saving purchase:', error);
        res.status(500).json({ message: 'Failed to save purchase' });
    }
  });

  app.get('/receipt/totalpurchases', async (req, res) => {
    try {
      const totalPurchases = await Receipt.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$receiptAmount' }, 
          },
        },
      ]);
  
      if (totalPurchases.length === 0) {
        return res.status(404).json({ message: 'No purchases found' });
      }
  
      res.status(200).json({ totalPurchases: totalPurchases[0].total });
    } catch (error) {
      console.error('Error calculating total purchases:', error);
      res.status(500).json({ message: 'Failed to calculate total purchases' });
    }
  });

  app.get('/receipts/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const allReceipts = await Receipt.find({ userId });

      res.status(200).json(allReceipts);
  
      if (allReceipts.length === 0) {
        return res.status(404).json({ message: 'No purchases found' });
      }
  
    } catch (error) {
      console.error('Error calculating total purchases:', error);
      res.status(500).json({ message: 'Failed to calculate total purchases' });
    }
  });


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})