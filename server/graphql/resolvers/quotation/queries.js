import { join } from 'path';
import moment from 'moment-timezone';
import { format } from '../../../../src/utils/functions';
import { Quotation } from '../../../mongo-db/models';
import { createPDF } from '../../../utils/pdfs';

const quotationQueries = {
  quotation: async (_, { id }) => Quotation.findOne({ _id: id }),
  quotations: async (_, { filters }) => {
    const { businessName, name, validRange = {}, createdRange = {} } = filters;

    const query = {
      deleted: false,
      validUntil: {
        $gte: new Date(validRange.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(validRange.end || '2100-12-31T00:00:00.000Z')
      },
      createdAt: {
        $gte: new Date(createdRange.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(createdRange.end || '2100-12-31T00:00:00.000Z')
      },
      $or: [{ businessName: new RegExp(businessName, 'i') }, { name: new RegExp(name, 'i') }]
    };

    return Quotation.find(query)
      .populate('products.rock')
      .populate('createdBy');
  },
  quotationPDF: async (_, { id }) => {
    const quotation = await Quotation.findOne({ _id: id })
      .populate('products.rock')
      .populate('createdBy');

    const pdfOptions = {
      content: [
        // Header
        {
          image: join(__dirname, '../../../../public/static/images/gemsa-logo.jpeg'),
          width: 150
        },
        {
          text: 'Cotización',
          style: 'invoiceTitle',
          width: '*'
        },
        {
          text: `Monterrey, Nuevo León a ${moment().format('LL')}`,
          style: 'invoiceDate',
          width: '*'
        },
        {
          text: 'Atención:',
          style: 'invoiceSubTitle',
          width: '*'
        },
        {
          text: quotation.name,
          style: 'invoiceSubValue',
          width: '*'
        },
        quotation.businessName && {
          text: quotation.businessName,
          style: 'invoiceSubValue',
          width: '*'
        },
        // Folios
        {
          margin: [0, 20, 0, 0],
          text:
            'Por medio de la presente le hacemos llegar la cotización de los materiales solicitados, así como las características de los mismos.'
        },
        // Line breaks
        '\n\n',
        // Items
        {
          alignment: 'center',
          table: {
            headerRows: 1,
            widths: (() => {
              const widths = [30, '*', 80];

              if (quotation.hasFreight) {
                widths.push(80);
                widths.push(80);
              }

              return widths;
            })(),
            body: [
              // Table Header
              (() => {
                const header = [
                  {
                    text: 'No.',
                    style: ['itemsHeader', 'center']
                  },
                  {
                    text: 'Producto',
                    style: 'itemsHeader'
                  },
                  {
                    text: 'Precio / ton',
                    style: ['itemsHeader', 'center']
                  }
                ];

                if (quotation.hasFreight) {
                  header.push({
                    text: 'Flete / ton',
                    style: ['itemsHeader', 'center']
                  });
                  header.push({
                    text: 'Precio final / ton',
                    style: ['itemsHeader', 'center']
                  });
                }

                return header;
              })(),
              // Items
              ...quotation.products.map(({ rock, price, freight }, index) => {
                const item = [
                  {
                    text: index + 1,
                    style: 'itemNumber'
                  },
                  {
                    text: rock.name,
                    style: 'itemTitle'
                  },
                  {
                    text: format.currency(price),
                    style: 'itemNumber'
                  }
                ];

                if (quotation.hasFreight) {
                  item.push({
                    text: format.currency(freight),
                    style: 'itemNumber'
                  });
                  item.push({
                    text: format.currency(price + freight),
                    style: 'itemNumber'
                  });
                }

                return item;
              })
            ]
          }
        },
        // Valid until
        {
          margin: [0, 20, 0, 0],
          text: `Esta cotización esta valida desde el ${moment(quotation.createdAt).format(
            'LL'
          )} al ${moment(quotation.validUntil).format(
            'LL'
          )}, cualquier duda comunicarse al departamento de ventas. `
        },
        // Notes
        {
          text: 'NOTAS',
          style: 'notesTitle'
        },
        {
          ul: [
            {
              text: 'Precios por tonelada',
              style: 'notesText'
            },
            {
              text: 'Precios más IVA',
              style: 'notesText'
            },
            !quotation.hasFreight
              ? {
                  text: 'Precio libre abordo ',
                  style: 'notesText'
                }
              : {}
          ],
          margin: [0, 0, 0, 20]
        },
        // Signature
        'Quedo a tus órdenes',
        {
          stack: [
            {
              text: '_________________________________',
              style: 'signaturePlaceholder'
            },
            {
              text: `${quotation.createdBy.firstName} ${quotation.createdBy.lastName}`,
              style: 'signatureName'
            },
            'Departamento de ventas',
            'Grupo Emmont de México SA de CV'
          ],
          width: 180
        }
      ],
      styles: {
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 15]
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          bold: true,
          alignment: 'left'
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: 'left'
        },
        invoiceDate: {
          fontSize: 12,
          alignment: 'right'
        },
        // Items Header
        itemsHeader: {
          margin: [0, 2, 0, 2],
          bold: true
        },
        // Item Title
        itemTitle: {
          bold: true,
          margin: [0, 2, 0, 2]
        },
        itemNumber: {
          margin: [0, 2, 0, 2],
          alignment: 'center'
        },
        itemTotal: {
          margin: [0, 2, 0, 2],
          bold: true,
          alignment: 'center'
        },
        // Signature
        signaturePlaceholder: {
          margin: [0, 40, 0, 0]
        },
        signatureName: {
          bold: true,
          alignment: 'left'
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: 'center'
        },
        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterSubTitle: {
          margin: [0, 2, 0, 2],
          bold: true,
          alignment: 'right'
        },
        itemsFooterSubValue: {
          margin: [0, 2, 0, 2],
          bold: true,
          alignment: 'center'
        },
        itemsFooterTotalTitle: {
          margin: [0, 2, 0, 2],
          bold: true,
          alignment: 'right'
        },
        itemsFooterTotalValue: {
          margin: [0, 2, 0, 2],
          bold: true,
          alignment: 'center'
        },
        // Notes
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 20, 0, 3]
        },
        notesText: {
          fontSize: 10
        },
        center: {
          alignment: 'center'
        }
      },
      defaultStyle: {
        columnGap: 20,
        fontSize: 10
      }
    };

    return createPDF(pdfOptions);
  }
};

export default quotationQueries;
