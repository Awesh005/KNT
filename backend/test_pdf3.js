const PdfPrinter = require('pdfmake/js/Printer').default;
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
const pdfMake = require('pdfmake');

try {
  // dummy urlResolver
  const urlResolver = {
    resolve: () => {},
    resolved: () => Promise.resolve()
  };
  const printer = new PdfPrinter(fonts, null, urlResolver);
  const docDefinition = {
    defaultStyle: { font: 'Helvetica' },
    content: [ 'Hello World' ]
  };
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  console.log("PDF created successfully");
} catch (e) {
  console.error("Error creating PDF:", e);
}
