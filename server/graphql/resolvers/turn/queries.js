import ExcelJS from 'exceljs';
import { Ticket, Turn } from '../../../mongo-db/models';
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
  turnSummary: authenticated(async () => {
    const turn = await Turn.findOne({ end: { $exists: false } });
    const clients = await Ticket.aggregate([
      {
        $match: { turn: turn._id, totalPrice: { $exists: true }, outTruckImage: { $exists: true } }
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
    const clients = await Ticket.aggregate([
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
    ]);

    const attributes = [
      {
        header: 'Cliente',
        key: 'businessName'
      },
      {
        header: 'RFC',
        key: 'rfc'
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

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'GEMSA';
    workbook.lastModifiedBy = 'GEMSA';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet('Boletas', {
      pageSetup: { fitToPage: true, orientation: 'landscape' }
    });
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    worksheet.columns = attributes;

    clients.forEach(({ client, tickets, totalWeight, subtotal, tax, totalPrice }) => {
      const clientInfoRow = {
        businessName: client[0].businessName,
        rfc: client[0].rfc
      };

      worksheet.addRow(clientInfoRow);

      tickets.forEach(ticket => {
        const ticketRow = {
          folio: ticket.folio,
          out: ticket.out,
          plates: ticket.truck[0].plates,
          product: ticket.product[0].name,
          totalWeight: ticket.totalWeight,
          subtotal: ticket.subtotal,
          tax: ticket.tax,
          totalPrice: ticket.totalPrice,
          credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
          bill: ticket.bill ? 'FACTURA' : 'REMISIÓN'
        };

        worksheet.addRow(ticketRow);
      });

      const resultsRow = {
        businessName: 'Total',
        totalWeight: `${totalWeight} tons`,
        subtotal: `$${subtotal}`,
        tax: `$${tax}`,
        totalPrice: `$${totalPrice}`
      };

      worksheet.addRow(resultsRow);
      Object.keys(resultsRow).forEach(key => {
        worksheet.lastRow.getCell(key).border = {
          top: { style: 'medium' },
          bottom: { style: 'medium' }
        };
      });

      worksheet.addRow({});
    });

    const firstRow = worksheet.getRow(1);
    firstRow.font = {
      size: 12,
      bold: true
    };
    firstRow.alignment = { vertical: 'middle', horizontal: 'center' };
    firstRow.height = 20;

    const buffer = await workbook.xlsx.writeBuffer();

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  })
};

export default turnQueries;
