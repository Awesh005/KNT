const pdfMake = require('pdfmake');
console.log(typeof pdfMake);
const PdfPrinter = require('pdfmake');
const printer = new PdfPrinter({ Roboto: { normal: 'Helvetica' } });
console.log(printer);
