import PDFPrinter from 'pdfmake';

const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  },
  Symbol: {
    normal: 'Symbol'
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats'
  }
};

const createPDF = options =>
  new Promise((resolve, reject) => {
    const printer = new PDFPrinter(fonts);

    const doc = printer.createPdfKitDocument({
      pageMargins: [35, 35, 35, 35],
      ...options,
      defaultStyle: {
        font: 'Helvetica',
        ...options.defaultStyle
      }
    });

    const chunks = [];

    doc.on('error', err => reject(err));

    doc.on('data', chunk => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      const pdfBase64 = result.toString('base64');
      resolve(`data:application/pdf;base64,${pdfBase64}`);
    });

    doc.end();
  });

export { createPDF };
