const cheerio = require('cheerio');
const parseData = (res) => {

        let fulldata = {};

        const $ = cheerio.load(res.data);
        const htmlReceipt = $("pre").text();
    
        const receiptRawData = htmlReceipt.split('\n========================================\n');
        const receiptItems = receiptRawData[1].split('\n');
        const receiptTax = parseFloat(receiptRawData[2].split('\n----------------------------------------\n')[1].split(':')[1].trim().replace(',','.'));
        let timeDate = receiptRawData[3].split('\n')[0].split('време:')[1].trim();

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
                item.price = parseFloat(con2[1].replace('.','').replace(',','.'));
                item.amount = parseFloat(con2[2].replace('.','').replace(',','.'));
                item.total = parseFloat(con2[3].replace('.','').replace(',','.'));
            items.push(item);
            }
    
        });

        const [datePart, timePart] = timeDate.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        timeDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);

        fulldata = {...sellerData,items, receiptAmount: receiptAmount, receiptTax, timeDate};
        // console.log(fulldata,'testere');
        return fulldata;
        // module.exports = {clicker,fulldata}

}

// axios.get(url).then( (res) =>{
//     parseData(res);
//     }
// );

module.exports = {parseData};
