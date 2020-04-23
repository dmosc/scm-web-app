import { join } from 'path';
import moment from 'moment';
import { Quotation } from '../../../mongo-db/models';
import { createPDF } from '../../../utils/pdfs';

const quotationQueries = {
  quotation: async (_, { id }) => Quotation.findOne({ _id: id }),
  quotations: async (_, { filters }) => {
    const { client, validRange = {}, createdRange = {} } = filters;

    const query = {
      deleted: false,
      validUntil: {
        $gte: new Date(validRange.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(validRange.end || '2100-12-31T00:00:00.000Z')
      },
      createdAt: {
        $gte: new Date(createdRange.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(createdRange.end || '2100-12-31T00:00:00.000Z')
      }
    };

    if (client) query.client = new RegExp(client, 'i');

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
          columns: [
            {
              image: join(__dirname, '../../../../public/static/images/gemsa-logo.jpeg'),
              width: 100
            },
            [
              {
                text: 'Cotización',
                style: 'invoiceTitle',
                width: '*'
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Cotización',
                        style: 'invoiceSubTitle'
                      },
                      {
                        text: quotation.folio,
                        style: 'invoiceSubValue',
                        width: 150
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: 'Fecha',
                        style: 'invoiceSubTitle'
                      },
                      {
                        text: moment(quotation.createdAt).format('l'),
                        style: 'invoiceSubValue',
                        width: 150
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: 'Vigente hasta',
                        style: 'invoiceSubTitle'
                      },
                      {
                        text: moment(quotation.validUntil).format('l'),
                        style: 'invoiceSubValue',
                        width: 150
                      }
                    ]
                  }
                ]
              }
            ]
          ]
        },
        // Folios
        {
          margin: [0, 20, 0, 0],
          text: `Se anexa la cotización de precio de venta dirigida a ${quotation.client}, por los siguientes productos:`
        },
        // Line breaks
        '\n\n',
        // Items
        {
          table: {
            headerRows: 1,
            widths: ['*', 80],
            body: [
              // Table Header
              [
                {
                  text: 'Producto',
                  style: 'itemsHeader'
                },
                {
                  text: 'Precio',
                  style: ['itemsHeader', 'center']
                }
              ],
              // Items
              ...quotation.products.map(({ rock, price }) => {
                return [
                  {
                    text: rock.name,
                    style: 'itemTitle'
                  },
                  {
                    text: `$${price} MXN`,
                    style: 'itemNumber'
                  }
                ];
              })
            ]
          }
        },
        // Signature
        {
          columns: [
            {
              text: ''
            },
            {
              stack: [
                {
                  text: '________________________________',
                  style: 'signaturePlaceholder'
                },
                {
                  text: `${quotation.createdBy.firstName} ${quotation.createdBy.lastName}`,
                  style: 'signatureName'
                }
              ],
              width: 180
            }
          ]
        },
        {
          text: 'NOTAS',
          style: 'notesTitle'
        },
        {
          text: '- Los precios son mas IVA por tonelada',
          style: 'notesText'
        },
        {
          text: '- Cambio de precio y vigencia con previo aviso',
          style: 'notesText'
        },
        {
          text: quotation.freight
            ? `- El flete se cotiza por $${quotation.freight} MXN`
            : '- No incluye flete',
          style: 'notesText'
        }
      ],
      styles: {
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'right',
          margin: [0, 0, 0, 15]
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          bold: true,
          alignment: 'right'
        },
        invoiceSubValue: {
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
          margin: [0, 70, 0, 0]
        },
        signatureName: {
          bold: true,
          alignment: 'center'
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: 'center'
        },
        // Notes
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3]
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
