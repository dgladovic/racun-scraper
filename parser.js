const cheerio = require('cheerio');
const parseData = (res) => {

        let fulldata = {};

        const $ = cheerio.load(res.data);
        const htmlReceipt = $("pre").text();
    
        const receiptRawData = htmlReceipt.split('\n========================================\n');
        const receiptItems = receiptRawData[1].split('\n');
        const receiptTax = parseFloat(receiptRawData[2].split('\n----------------------------------------\n')[1].split(':')[1].trim().replace(',','.')).toFixed(2);
        let timeDate = receiptRawData[3].split('\n')[0].split('време:')[1].trim();
        const realReceiptNumber = receiptRawData[3].split('\n')[1].split('рачуна:')[1].trim();


        const receiptRawAmount = receiptItems.slice(receiptItems.length-2,receiptItems.length-1)[0].split(':');
        const parsedAmount = receiptRawAmount[1].replace('.',' ').replace(',','.').trim().split();
        let receiptAmount = parseFloat(parsedAmount[0].replace(/\s+/g, "!").replace('!','')).toFixed(2);
    
        const parsingSellerInfo = receiptRawData[0].split('\n');
        const sellerData = {
            name: parsingSellerInfo[2],
            taxName: parsingSellerInfo[3],
            taxNumber: parseInt(parsingSellerInfo[1]),
            receiptNumber: realReceiptNumber,
            address: parsingSellerInfo[4].trim(),
            location: parsingSellerInfo[5],
        }
            
        const parsingData = receiptItems.slice(1,receiptItems.length-3);
    
        let items = [];
        let checkIfString;
        let secondRow;

        let e;
        let i;
    
        for(let j = 0; j < parsingData.length; j++){
            e = parsingData[j];
            i = j;
            var item = {};

            if(i % 2 === 0){    // obradjuje cenu artikla i naziv tako sto poredi i sledeci red
                item.name = e.trim();
                if(!parsingData[i+1]){  // ovo je provera za to da li je kraj niza na racunu
                    checkIfString = 1000;
                }else{
                    checkIfString = parsingData[i+1].trim();
                }
                if(checkIfString.length > 0){   // trebalo bi da se ovo gura u stack, pa odatle da se vadi
                    secondRow = checkIfString;
                    checkIfString = checkIfString.replace(/\s+/g, "!");
                    checkIfString = checkIfString.split('!');
                    checkIfString = parseFloat(checkIfString[0].replace('.','').replace(',','.'));
                    if(isNaN(checkIfString)){
                        item.name = item.name + secondRow;
                    }
                }else{
                    checkIfString = 1000;
                }

                if(isNaN(checkIfString)){    // ukoliko je broj vraca false, a ovo je za multi-line
                    let tab = parsingData[i+2].trim();
                    let cont = parsingData[i+2].replace(/\s+/g, "!");
                    let con2 = cont.split('!');
                    item.price = parseFloat(con2[1].replace('.','').replace(',','.'));
                    item.amount = parseFloat(con2[2].replace('.','').replace(',','.'));
                    item.total = parseFloat(con2[3].replace('.','').replace(',','.')).toFixed(2);
                    items.push(item);
                    j = j + 1;
                    continue;
                }   
                if(parsingData.length - 1 != j){    // ovo je za single line iteme na racnuu
                    let tab = parsingData[i+1].trim();
                    let cont = parsingData[i+1].replace(/\s+/g, "!");
                    let con2 = cont.split('!');
                    item.price = parseFloat(con2[1].replace('.','').replace(',','.'));
                    item.amount = parseFloat(con2[2].replace('.','').replace(',','.'));
                    item.total = parseFloat(con2[3].replace('.','').replace(',','.')).toFixed(2);
                    items.push(item); 
                }
            }
    
        }
        const [datePart, timePart] = timeDate.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');
        let string = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        timeDate = new Date(string);

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
