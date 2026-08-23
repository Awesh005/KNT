const PdfPrinter = require('pdfmake/js/Printer').default;
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
try {
  const printer = new PdfPrinter(fonts);
  const docDefinition = {
    defaultStyle: { font: 'Helvetica' },
    content: [ 'Hello World' ]
  };
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  console.log("PDF created successfully");
} catch (e) {
  console.error("Error creating PDF:", e);
}
