const express = require('express');
const fs = require('fs');
const app = express();
const port = 4800;
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const parser = require('./parser');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: '*'
}));

app.use(bodyParser.json());

app.get('/', (req,res) => {

    // let url = req.url.slice(8,);

    // // res.send(parser.fulldata);
    // axios.get(url).then( (el) =>{
    //     const hey = parser.parseData(el);
    //     res.send(hey);
    //     // console.log(hey);
    // })
    // console.log(req.query,'tabla');

});

app.get('/scan/:id', (req,res) => {

    let url = req.url.slice(8,);

    axios.get(url).then( (el) =>{
        const hey = parser.parseData(el);
        res.send(hey);
    })


});

app.post('/scan/save', (req, res) => {
    const payload = req.body;
    // Here you can save the payload to a database or perform any other desired action
    console.log('Received payload:', payload);
    res.status(200).json({ message: 'Payload saved successfully' });
  });


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})