import moment from 'moment-timezone';
import { join } from 'path';
import { format } from '../../../../src/utils/functions/index';
import { Bill } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import { createPDF } from '../../../utils/pdfs';

const billQueries = {
  bill: authenticated(async (_, { id, folio }) => {
    const bill = await Bill.findOne({
      $or: [{ _id: id }, { folio }]
    }).populate('client store');

    if (!bill) throw new Error('¡No ha sido posible encontrar esta factura!');

    return bill;
  }),
  billPDF: async (_, { id, folio }) => {
    const bill = await Bill.findOne({
      $or: [{ _id: id }, { folio }]
    }).populate('client store products.product');

    const { client, store } = bill;
    const { address } = client;

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
                text: bill.bill ? 'Factura' : 'Remision',
                style: 'invoiceTitle',
                width: '*'
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: bill.bill ? 'Factura' : 'Remision',
                        style: 'invoiceSubTitle'
                      },
                      {
                        text: bill.folio,
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
                        text: moment(bill.date).format('l LTS'),
                        style: 'invoiceSubValue',
                        width: 150
                      }
                    ]
                  },
                  bill.creditDays > 0
                    ? {
                        columns: [
                          {
                            text: 'Crédito',
                            style: 'invoiceSubTitle'
                          },
                          {
                            text: `${bill.creditDays} días`,
                            style: 'invoiceSubValue',
                            width: 150
                          }
                        ]
                      }
                    : {}
                ]
              }
            ]
          ]
        },
        // Folios
        {
          margin: [0, 20, 0, 0],
          columns: [
            {
              text: 'Folios',
              style: 'invoiceBillingDetailsTitle',
              width: '15%'
            },
            {
              text: bill.folios.toString(),
              style: 'invoiceBillingDetails',
              width: '85%',
              alignment: 'right'
            }
          ]
        },
        // Billing Headers
        {
          margin: [0, 0, 0, 0],
          columns: [
            {
              text: 'Receptor',
              style: 'invoiceBillingTitle'
            }
          ]
        },
        // Billing Details
        {
          columns: [
            {
              stack: [
                {
                  columns: [
                    {
                      text: 'RFC',
                      style: 'invoiceBillingDetailsTitle',
                      width: '15%'
                    },
                    {
                      text: client.rfc,
                      style: 'invoiceBillingDetails'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: 'Razón Social',
                      style: 'invoiceBillingDetailsTitle',
                      width: '15%'
                    },
                    {
                      text: client.businessName,
                      style: 'invoiceBillingDetails'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: 'Dirección',
                      style: 'invoiceBillingDetailsTitle',
                      width: '15%'
                    },
                    {
                      text: address.street
                        ? `${address.street} #${address.extNumber} ${address.municipality}, ${address.state}`
                        : 'N/A',
                      style: 'invoiceBillingDetails'
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Billing Headers
        {
          columns: [
            {
              text: 'Sucursal',
              style: 'invoiceBillingTitle'
            }
          ]
        },
        // Billing Details
        {
          columns: [
            {
              stack: [
                {
                  columns: [
                    {
                      text: 'Nombre',
                      style: 'invoiceBillingDetailsTitle',
                      width: '15%'
                    },
                    {
                      text: !store ? 'Matriz' : store.name,
                      style: 'invoiceBillingDetails'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: 'Dirección',
                      style: 'invoiceBillingDetailsTitle',
                      width: '15%'
                    },
                    {
                      text: !store ? 'Matriz' : store.address || 'N/A',
                      style: 'invoiceBillingDetails'
                    }
                  ]
                },
                store
                  ? {
                      columns: [
                        {
                          text: 'Ciudad',
                          style: 'invoiceBillingDetailsTitle',
                          width: '15%'
                        },
                        {
                          text: `${store.municipality || 'N/A'}, ${store.state || 'N/A'}`,
                          style: 'invoiceBillingDetails'
                        }
                      ]
                    }
                  : {}
              ]
            }
          ]
        },
        // Line breaks
        '\n\n',
        // Items
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80, 80],
            body: [
              // Table Header
              [
                {
                  text: 'Producto',
                  style: 'itemsHeader'
                },
                {
                  text: 'Tons',
                  style: ['itemsHeader', 'center']
                },
                {
                  text: 'Precio',
                  style: ['itemsHeader', 'center']
                },
                {
                  text: 'Total',
                  style: ['itemsHeader', 'center']
                }
              ],
              // Items
              ...bill.products.map(({ product, weight, price, total }) => {
                return [
                  {
                    text: product.name,
                    style: 'itemTitle'
                  },
                  {
                    text: format.number(weight),
                    style: 'itemNumber'
                  },
                  {
                    text: format.currency(price),
                    style: 'itemNumber'
                  },
                  {
                    text: format.currency(total),
                    style: 'itemTotal'
                  }
                ];
              })
            ]
          }
        },
        // TOTAL
        {
          table: {
            headerRows: 0,
            widths: ['*', 80],
            body: [
              // Total
              [
                {
                  text: 'Subtotal',
                  style: 'itemsFooterSubTitle'
                },
                {
                  text: `${format.currency(bill.total - bill.tax)} MXN`,
                  style: 'itemsFooterSubValue'
                }
              ],
              [
                {
                  text: 'Impuestos',
                  style: 'itemsFooterSubTitle'
                },
                {
                  text: `${format.currency(bill.tax)} MXN`,
                  style: 'itemsFooterSubValue'
                }
              ],
              [
                {
                  text: 'TOTAL',
                  style: 'itemsFooterTotalTitle'
                },
                {
                  text: `${format.currency(bill.total)} MXN`,
                  style: 'itemsFooterTotalValue'
                }
              ]
            ]
          }, // table
          layout: 'lightHorizontalLines'
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
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 10, 0, 0]
        },
        // Billing Details
        invoiceBillingDetailsTitle: {
          bold: true,
          fontSize: 10
        },
        invoiceBillingDetails: {
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
  },
  bills: authenticated(async (_, { filters: { limit, search, sortBy } }) => {
    const billPromise = Bill.find({
      deleted: false,
      $or: [{ folio: { $in: [new RegExp(search, 'i')] } }]
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('client store');

    if (sortBy) {
      const { field, order } = sortBy;
      billPromise.sort({ [field]: order });
    }

    const bills = await billPromise;

    if (!bills) throw new Error('¡No ha sido posible cargar las facturas!');

    return bills;
  })
};

export default billQueries;
