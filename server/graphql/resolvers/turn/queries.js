import cloneDeep from 'lodash.clonedeep';
import { Ticket, Turn } from '../../../mongo-db/models';
import { createWorksheet, createWorkbook } from '../../../utils/reports';
import periods from '../../../../src/utils/enums/periods';
import authenticated from '../../middleware/authenticated';

const turnQueries = {
  turn: authenticated(async (_, args) => {
    const { id } = args;
    const turn = await Turn.findOne({ _id: id }).populate('user');

    if (!turn) throw new Error('¡No ha sido posible encontrar el turno!');

    return turn;
  }),
  turns: authenticated(async (_, { filters: { limit } }) => {
    const turns = await Turn.find({})
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('user');

    if (!turns) throw new Error('¡Ha habido un error cargando los turnos!');

    return turns;
  }),
  turnActive: authenticated(() => {
    return Turn.findOne({ end: { $exists: false } });
  }),
  turnSummary: authenticated(async (_, { ticketType }) => {
    const turn = await Turn.findOne({ end: { $exists: false } });

    const $match = {
      turn: turn._id,
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true }
    };

    if (ticketType) {
      switch (ticketType) {
        case 'CASH':
          $match.credit = false;
          break;
        case 'CREDIT':
          $match.credit = true;
          break;
        default:
          break;
      }
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
          count: { $sum: 1 },
          tickets: {
            $push: {
              id: '$_id',
              folio: '$folio',
              driver: '$driver',
              truck: '$truck',
              product: '$product',
              tax: '$tax',
              weight: '$weight',
              totalWeight: '$totalWeight',
              totalPrice: '$totalPrice',
              credit: '$credit',
              inTruckImage: '$inTruckImage',
              outTruckImage: '$outTruckImage'
            }
          }
        }
      },
      { $project: { _id: 0, info: '$_id', count: '$count', tickets: '$tickets' } }
    ]);

    if (clients.length === 0) return { clients, upfront: 0, credit: 0, total: 0 };

    let upfront = 0;
    let credit = 0;
    let total = 0;
    for (const client of clients) {
      const { tickets } = client;
      for (const ticket of tickets) {
        if (ticket.credit) credit += ticket.totalPrice;
        else upfront += ticket.totalPrice;

        total += ticket.totalPrice;
      }
    }

    for (let i = 0; i < clients.length; i++) {
      // Parse data and remove generated arrays from $lookups
      clients[i].info = { ...clients[i].info[0] };
      clients[i].info.id = clients[i].info._id;
      delete clients[i].info._id;

      const { tickets } = clients[i];
      for (const ticket of tickets) {
        ticket.product = { ...ticket.product[0] };
        ticket.truck = { ...ticket.truck[0] };

        ticket.product.id = ticket.product._id;
        ticket.truck.id = ticket.truck._id;

        delete ticket.product._id;
        delete ticket.truck._id;
      }
    }

    return { clients, upfront, credit, total };
  }),
  turnSummaryXLS: authenticated(async () => {
    const turn = await Turn.findOne({ end: { $exists: false } });

    const aggregation = [
      {
        $match: { turn: turn._id, totalPrice: { $exists: true }, outTruckImage: { $exists: true } }
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
    ];

    // Here we explicitly need a recursive copy function to
    // clone very single value unlinking value pointers
    const creditAggregation = cloneDeep(aggregation);
    const cashAggregation = cloneDeep(aggregation);

    creditAggregation[0].$match.credit = true;
    cashAggregation[0].$match.credit = false;

    const [clientsCredit, clientsCash] = await Promise.all([
      Ticket.aggregate(creditAggregation),
      Ticket.aggregate(cashAggregation)
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
        date: turn.end,
        title: `Boletas por tipo de pago  del corte de turno: ${turn.uniqueId}  (${
          periods[turn.period]
        })`
      },
      {
        pageSetup: { fitToPage: true, orientation: 'landscape' }
      }
    );

    const cashSums = {
      product: 0,
      totalWeight: 0,
      subtotal: 0,
      tax: 0,
      totalPrice: 0
    };

    const creditSums = {
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
          totalWeight: ticket.totalWeight.toFixed(2),
          subtotal: ticket.subtotal.toFixed(2),
          tax: ticket.tax.toFixed(2),
          totalPrice: ticket.totalPrice.toFixed(2),
          credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
          bill: ticket.bill ? 'FACTURA' : 'REMISIÓN'
        };

        worksheet.addRow(ticketRow);
      });

      const resultsRow = {
        product: tickets.length,
        totalWeight: `${totalWeight.toFixed(2)} tons`,
        subtotal: `$${subtotal.toFixed(2)}`,
        tax: `$${tax.toFixed(2)}`,
        totalPrice: `$${totalPrice.toFixed(2)}`
      };

      if (!isCreditRow) {
        cashSums.product += tickets.length;
        cashSums.totalWeight += totalWeight;
        cashSums.subtotal += subtotal;
        cashSums.tax += tax;
        cashSums.totalPrice += totalPrice;
      }

      if (isCreditRow) {
        creditSums.product += tickets.length;
        creditSums.totalWeight += totalWeight;
        creditSums.subtotal += subtotal;
        creditSums.tax += tax;
        creditSums.totalPrice += totalPrice;
      }

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

    if (clientsCash.length > 0) {
      worksheet.addRow({});
      worksheet.addRow({
        rfc: 'CONTADO'
      });
      worksheet.lastRow.getCell('rfc').font = {
        size: 14,
        bold: true
      };
      worksheet.addRow({});
      clientsCash.forEach(addClient);
      worksheet.addRow({});
      const resultsRow = {
        plates: 'Total',
        product: cashSums.product.toFixed(2),
        totalWeight: `$${cashSums.totalWeight.toFixed(2)} tons`,
        subtotal: `$${cashSums.subtotal.toFixed(2)}`,
        tax: `$${cashSums.tax.toFixed(2)}`,
        totalPrice: `$${cashSums.totalPrice.toFixed(2)}`
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
    }

    if (clientsCredit.length > 0) {
      worksheet.addRow({});
      worksheet.addRow({
        rfc: 'CRÉDITO'
      });
      worksheet.lastRow.getCell('rfc').font = {
        size: 14,
        bold: true
      };
      worksheet.addRow({});
      clientsCredit.forEach(addClient);
      worksheet.addRow({});
      const resultsRow = {
        plates: 'Total',
        product: creditSums.product.toFixed(2),
        totalWeight: `$${creditSums.totalWeight.toFixed(2)} tons`,
        subtotal: `$${creditSums.subtotal.toFixed(2)}`,
        tax: `$${creditSums.tax.toFixed(2)}`,
        totalPrice: `$${creditSums.totalPrice.toFixed(2)}`
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
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  })
};

export default turnQueries;
