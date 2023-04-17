const express = require('express');
const fs = require('fs');
const app = express();
const port = 4800;
const axios = require('axios');


const parser = require('./parser');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res) => {

    let url = req.url.slice(8,);

    // res.send(parser.fulldata);
    axios.get(url).then( (el) =>{
        const hey = parser.parseData(el);
        res.send(hey);
        // console.log(hey);
    })
    console.log(req.query,'tabla');

});

app.get('/scan/:id', (req,res) => {

    let url = req.url.slice(8,);

    // res.send(parser.fulldata);
    axios.get(url).then( (el) =>{
        const hey = parser.parseData(el);
        res.send(hey);
        // console.log(hey);
    })


});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})