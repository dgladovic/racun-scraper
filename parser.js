const axios = require('axios');
const cheerio = require('cheerio');

const clicker = async (url) => {

    let fulldata = {};

    await axios.get(url,{
        // headers: {
        //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        // }
    })
    .then( res => {
    const $ = cheerio.load(res.data);
    const htmlReceipt = $("pre").text();

    const receiptRawData = htmlReceipt.split('\n========================================\n');
    const receiptItems = receiptRawData[1].split('\n');
    const receiptTax = parseFloat(receiptRawData[2].split('\n----------------------------------------\n')[1].split(':')[1].trim().replace(',','.'));

    const receiptRawAmount = receiptItems.slice(receiptItems.length-2,receiptItems.length-1)[0].split(':');
    const parsedAmount = receiptRawAmount[1].replace('.',' ').replace(',','.').trim().split();
    let receiptAmount = parseFloat(parsedAmount[0].replace(/\s+/g, "!").replace('!',''));

    const parsingSellerInfo = receiptRawData[0].split('\n');
    const sellerData = {
        name: parsingSellerInfo[2],
        taxName: parsingSellerInfo[3],
        receiptNumber: parseInt(parsingSellerInfo[1]),
        address: parsingSellerInfo[4].trim(),
        location: parsingSellerInfo[5],
    }
    
    // console.log(sellerData,'opa');

    const parsingData = receiptItems.slice(1,receiptItems.length-3);

    let parsedData = [];

    parsingData.forEach( (e,i) =>{

        var item = {}

        if(i % 2 === 0){
            item.name = e.trim();
            let tab = parsingData[i+1].trim();
            let cont = parsingData[i+1].replace(/\s+/g, "!");
            let con2 = cont.split('!');
            item.price = parseFloat(con2[1].replace('.',' ').replace(',','.'));
            item.amount = parseFloat(con2[2].replace('.',' ').replace(',','.'));
            item.total = parseFloat(con2[3].replace('.',' ').replace(',','.'));
        parsedData.push(item);
        }

    });
    fulldata = {...sellerData,parsedData, receiptAmount: receiptAmount, receiptTax};
    // console.log(parsedData,'testere');
    // console.log(fulldata,'testere');
    // module.exports = {clicker,fulldata}
    })
}

// const url = 'https://suf.purs.gov.rs/v/?vl=A1FIMjZWNjRQUUgyNlY2NFDL8AEAw%2FABABBJ7AAAAAAAAAABhfJtLbIAAAAvoMsLPpipiKZ6rpct%2BjvxKP5jU1PT2AIFziE0Te3%2FTNdeP9IkvVoc9cEZ2tp7DP%2BEtqI6IuexKkQyG736ZAYwAUedkMLLKME20zSAc3lo7CBGhEa1U4nvpV3cPRxzrWd2fcmYNzgzSzhN1Ez3aGrJqq7AgsmJ3gYLiML7c%2BcwhBLGtBWVXokG5XCeqFF1sj9Id5wixtIRrVhx%2B2woocNq6BXp1%2BNOivBhtHo3LafprAxDvPe7sNd2a2%2B61vE8XRT9i1jKVoRhtgNV4pznglBGL1LomURFNUZRUOqOxNvZAVpM68Uw8mCecBM8NOpDUoXUDPn71mLtmFDXL9hbKPFPQFCuG6Zwn3ZDJWuSAnBiY6OlVRuiqRjJ8LB86fT%2FWYkjfYdbiJT5u3izATveoSGJgWpkU1oEiOz4ivK8qLeuY8ck3dCqfEZv%2Fx4jkrLqIF%2BQRWzPlx9oMFltt220YQYKw9rlR%2BCxyMZK%2FOEIOckMrl%2FhcUtP2alExFR0mRojWES84aCTmHgwhzEK8snkasiU5UucJIcQ9%2BzWInidfWWF393x90K6bUGohqUfnsJkggItQG48uUJnMd7xS1ioj3JOn%2FbyBPc4f7fbh1N4Xw2sxLj6vZ6JOp4D7IdpXdX%2BRTmE3gnsUhshx6BchmytoZtTGCMaAFdYioXBLtrQiaGQOzQ24iLErtdNal46swzXXZY%3D'

// clicker(url);

// console.log(clicker(url));



const parseData = (res) => {

        let fulldata = {};

        const $ = cheerio.load(res.data);
        const htmlReceipt = $("pre").text();
    
        const receiptRawData = htmlReceipt.split('\n========================================\n');
        const receiptItems = receiptRawData[1].split('\n');
        const receiptTax = parseFloat(receiptRawData[2].split('\n----------------------------------------\n')[1].split(':')[1].trim().replace(',','.'));

        const receiptRawAmount = receiptItems.slice(receiptItems.length-2,receiptItems.length-1)[0].split(':');
        const parsedAmount = receiptRawAmount[1].replace('.',' ').replace(',','.').trim().split();
        let receiptAmount = parseFloat(parsedAmount[0].replace(/\s+/g, "!").replace('!',''));
    
        const parsingSellerInfo = receiptRawData[0].split('\n');
        const sellerData = {
            name: parsingSellerInfo[2],
            taxName: parsingSellerInfo[3],
            receiptNumber: parseInt(parsingSellerInfo[1]),
            address: parsingSellerInfo[4].trim(),
            location: parsingSellerInfo[5],
        }
        
        // console.log(sellerData,'opa');
    
        const parsingData = receiptItems.slice(1,receiptItems.length-3);
    
        let items = [];
    
        parsingData.forEach( (e,i) =>{
    
            var item = {}
    
            if(i % 2 === 0){
                item.name = e.trim();
                let tab = parsingData[i+1].trim();
                let cont = parsingData[i+1].replace(/\s+/g, "!");
                let con2 = cont.split('!');
                item.price = parseFloat(con2[1].replace('.',' ').replace(',','.'));
                item.amount = parseFloat(con2[2].replace('.',' ').replace(',','.'));
                item.total = parseFloat(con2[3].replace('.',' ').replace(',','.'));
            items.push(item);
            }
    
        });
        // console.log(parsedData,'testere');
        fulldata = {...sellerData,items, receiptAmount: receiptAmount, receiptTax};
        // console.log(fulldata,'testere');
        return fulldata;
        // module.exports = {clicker,fulldata}

}

// axios.get(url).then( (res) =>{
//     parseData(res);
//     }
// );

module.exports = {parseData};
