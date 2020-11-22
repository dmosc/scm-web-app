import cloneDeep from 'lodash.clonedeep';
import { Ticket, Turn } from '../../../../../mongo-db/models';
import { createWorkbook } from '../../../../../utils/reports';
import authenticated from '../../../../middleware/authenticated';
import turnReportsUtils from './utils';

const turnReports = {
  turnSummaryXLS: authenticated(async (_, { uniqueId, ticketType }) => {
    const turn = await Turn.findOne({ uniqueId });

    const baseAggregation = [
      {
        $match: { turn: turn._id, totalPrice: { $exists: true }, outTruckImage: { $exists: true } }
      },
      { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
      { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
      { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
      {
        $lookup: {
          from: 'users',
          localField: 'usersInvolved.cashier',
          foreignField: '_id',
          as: 'cashier'
        }
      }
    ];

    const clientAggregation = [
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
              bill: '$bill',
              cashier: '$cashier'
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
    ];

    // Here we explicitly need a recursive copy function to
    // clone very single value unlinking value pointers
    // This way we can mutate the $match.credit on the following
    // lines without affecting the same pointer
    const clientsCreditAggregation = cloneDeep([...baseAggregation, ...clientAggregation]);
    const clientsCashAggregation = cloneDeep([...baseAggregation, ...clientAggregation]);

    clientsCreditAggregation[0].$match.credit = true;
    clientsCashAggregation[0].$match.credit = false;

    let tickets = [];
    let clientsCredit = [];
    let clientsCash = [];

    const promises = [Ticket.aggregate(baseAggregation)];

    switch (ticketType) {
      case 'CASH': {
        [tickets, clientsCash] = await Promise.all([
          ...promises,
          Ticket.aggregate(clientsCashAggregation)
        ]);
        break;
      }
      case 'CREDIT': {
        [tickets, clientsCredit] = await Promise.all([
          ...promises,
          Ticket.aggregate(clientsCreditAggregation)
        ]);
        break;
      }
      default: {
        [tickets, clientsCredit, clientsCash] = await Promise.all([
          ...promises,
          Ticket.aggregate(clientsCreditAggregation),
          Ticket.aggregate(clientsCashAggregation)
        ]);
        break;
      }
    }

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
      },
      {
        header: 'Cajero',
        key: 'cashier'
      }
    ];

    for (let i = 0; i < attributes.length; i++) attributes[i] = { ...attributes[i], width: 15 };

    const workbook = createWorkbook();

    const {
      turnSummaryXLS: { addWorksheetByTicketType, addWorksheetByCashier }
    } = turnReportsUtils;

    addWorksheetByTicketType(workbook, clientsCash, clientsCredit, attributes, turn);
    addWorksheetByCashier(workbook, tickets, attributes, turn);

    const buffer = await workbook.xlsx.writeBuffer();

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  })
};

export default turnReports;
