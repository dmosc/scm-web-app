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
      .limit(limit || 50)
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
              out: '$out',
              truck: '$truck',
              driver: '$driver',
              product: '$product',
              tax: '$tax',
              weight: '$weight',
              totalWeight: '$totalWeight',
              totalPrice: '$totalPrice'
            }
          }
        }
      },
      { $project: { _id: 0, client: '$_id', tickets: '$tickets' } }
    ]);

    const attributes = [
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
        key: 'date'
      },
      {
        header: 'Placas',
        key: 'plates'
      },
      {
        header: 'Marca',
        key: 'brand'
      },
      {
        header: 'Modelo',
        key: 'model'
      },
      {
        header: 'Conductor',
        key: 'driver'
      },
      {
        header: 'Producto',
        key: 'product'
      },
      {
        header: 'Peso del camión',
        key: 'truckWeight'
      },
      {
        header: 'Peso bruto',
        key: 'weight'
      },
      {
        header: 'Peso neto',
        key: 'totalWeight'
      },
      {
        header: 'Impuesto',
        key: 'tax'
      },
      {
        header: 'Total',
        key: 'totalPrice'
      }
    ];

    for (let i = 0; i < attributes.length; i++) attributes[i] = { ...attributes[i], width: 15 };

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'GEMSA';
    workbook.lastModifiedBy = 'GEMSA';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet('Boletas');
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    worksheet.columns = attributes;

    clients.forEach(({ client, tickets }) => {
      const clientInfoRow = {
        businessName: client[0].businessName
      };

      worksheet.addRow(clientInfoRow);

      tickets.forEach(ticket => {
        const ticketRow = {
          folio: ticket.folio,
          date: ticket.out,
          plates: ticket.truck[0].plates,
          brand: ticket.truck[0].brand,
          model: ticket.truck[0].model,
          driver: ticket.driver,
          product: ticket.product[0].name,
          truckWeight: ticket.truck[0].weight,
          weight: ticket.weight,
          totalWeight: ticket.totalWeight,
          tax: ticket.tax,
          totalPrice: ticket.totalPrice
        };

        worksheet.addRow(ticketRow);
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
