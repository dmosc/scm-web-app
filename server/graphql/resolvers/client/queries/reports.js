import moment from 'moment-timezone';
import { Types } from 'mongoose';
import { createWorkbook, createWorksheet } from '../../../../utils/reports';
import { format } from '../../../../../src/utils/functions';
import { Ticket } from '../../../../mongo-db/models';
import authenticated from '../../../middleware/authenticated';

const clientReports = {
  clientsSummaryXLS: authenticated(
    async (
      _,
      {
        clientIds,
        range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
        turnId,
        billType
      }
    ) => {
      const $match = {
        client: { $in: clientIds.map(id => Types.ObjectId(id)) },
        out: { $gte: new Date(range.start), $lte: new Date(range.end) },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true }
      };

      if (turnId) {
        $match.turn = Types.ObjectId(turnId);
      }

      if (billType) {
        if (billType === 'BILL') $match.tax = { $gt: 0 };
        if (billType === 'REMISSION') $match.tax = { $eq: 0 };
      }

      const clients = await Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
        {
          $group: {
            _id: '$client',
            tickets: {
              $push: {
                folio: '$folio',
                truck: '$truck',
                out: {
                  $dateToString: {
                    date: '$out',
                    format: '%Y-%m-%d %H:%M:%S',
                    timezone: 'America/Monterrey'
                  }
                },
                product: '$product',
                totalWeight: '$totalWeight',
                tax: '$tax',
                subtotal: { $subtract: ['$totalPrice', '$tax'] },
                totalPrice: '$totalPrice',
                credit: '$credit',
                bill: '$bill'
              }
            },
            totalWeight: { $sum: '$totalWeight' },
            subtotal: { $sum: { $subtract: ['$totalPrice', '$tax'] } },
            tax: { $sum: '$tax' },
            totalPrice: { $sum: '$totalPrice' }
          }
        },
        {
          $project: {
            _id: 0,
            client: '$_id',
            tickets: '$tickets',
            totalWeight: '$totalWeight',
            subtotal: '$subtotal',
            tax: '$tax',
            totalPrice: '$totalPrice'
          }
        }
      ]);

      const attributes = [
        {
          header: 'RFC',
          key: 'rfc'
        },
        {
          header: 'Cliente',
          key: 'businessName'
        },
        {
          header: 'Folio',
          key: 'folio'
        },
        {
          header: 'Fecha',
          key: 'out'
        },
        {
          header: 'Placas',
          key: 'plates'
        },
        {
          header: 'Producto',
          key: 'product'
        },
        {
          header: 'Peso neto',
          key: 'totalWeight'
        },
        {
          header: 'Subtotal',
          key: 'subtotal'
        },
        {
          header: 'Impuesto',
          key: 'tax'
        },
        {
          header: 'Total',
          key: 'totalPrice'
        },
        {
          header: 'Tipo de pago',
          key: 'credit'
        },
        {
          header: 'Tipo de boleta',
          key: 'bill'
        }
      ];

      for (let i = 0; i < attributes.length; i++) attributes[i] = { ...attributes[i], width: 15 };

      const workbook = createWorkbook();

      const worksheet = createWorksheet(
        workbook,
        {
          name: 'Boletas',
          columns: attributes,
          date: new Date(),
          title: `Boletas por clientes del ${moment(range.start).format('lll')} al ${moment(
            range.end
          ).format('lll')}`
        },
        {
          pageSetup: { fitToPage: true, orientation: 'landscape' }
        }
      );

      const sums = {
        product: 0,
        totalWeight: 0,
        subtotal: 0,
        tax: 0,
        totalPrice: 0
      };

      const addClient = ({ client, tickets, totalWeight, subtotal, tax, totalPrice }) => {
        const clientInfoRow = {
          rfc: client[0].rfc,
          businessName: client[0].businessName
        };

        worksheet.addRow(clientInfoRow);
        Object.keys(clientInfoRow).forEach(key => {
          worksheet.lastRow.getCell(key).font = {
            size: 12,
            bold: true
          };
        });

        let isCreditRow;

        tickets.forEach(ticket => {
          if (!isCreditRow && ticket.credit) isCreditRow = true;

          const ticketRow = {
            folio: ticket.folio,
            out: ticket.out,
            plates: ticket.truck[0].plates,
            product: ticket.product[0].name,
            totalWeight: format.number(ticket.totalWeight),
            subtotal: format.number(ticket.subtotal),
            tax: format.number(ticket.tax),
            totalPrice: format.number(ticket.totalPrice),
            credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
            bill: ticket.bill ? 'FACTURA' : 'REMISIÓN'
          };

          worksheet.addRow(ticketRow);
        });

        const resultsRow = {
          product: tickets.length,
          totalWeight: `${format.number(totalWeight)} tons`,
          subtotal: format.currency(subtotal),
          tax: format.currency(tax),
          totalPrice: format.currency(totalPrice)
        };

        sums.product += tickets.length;
        sums.totalWeight += totalWeight;
        sums.subtotal += subtotal;
        sums.tax += tax;
        sums.totalPrice += totalPrice;

        worksheet.addRow(resultsRow);
        Object.keys(resultsRow).forEach(key => {
          const row = worksheet.lastRow.getCell(key);
          row.border = {
            top: { style: 'medium' }
          };
          row.font = {
            size: 12,
            bold: true
          };
        });

        worksheet.addRow({});
      };

      clients.forEach(addClient);
      worksheet.addRow({});
      const resultsRow = {
        plates: 'Total',
        product: format.number(sums.product),
        totalWeight: `${format.number(sums.totalWeight)} tons`,
        subtotal: format.currency(sums.subtotal),
        tax: format.currency(sums.tax),
        totalPrice: format.currency(sums.totalPrice)
      };
      worksheet.addRow(resultsRow);
      Object.keys(resultsRow).forEach(key => {
        const row = worksheet.lastRow.getCell(key);
        row.border = {
          top: { style: 'medium' }
        };
        row.font = {
          size: 12,
          bold: true
        };
      });
      worksheet.addRow({});

      const buffer = await workbook.xlsx.writeBuffer();

      return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
        'base64'
      )}`;
    }
  )
};

export default clientReports;
