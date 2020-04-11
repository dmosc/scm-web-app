import ExcelJS from 'exceljs';
import { Types } from 'mongoose';
import { Client, ClientPrice, Rock, Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const clientQueries = {
  client: authenticated(async (_, args) => {
    const { id } = args;
    const client = await Client.findOne({ _id: id, deleted: false }).populate(
      'trucks stores depositHistory.depositedBy'
    );

    if (!client) throw new Error('¡El cliente no existe!');

    return client;
  }),
  clients: authenticated(async (_, { filters: { limit, search } }) => {
    const clients = await Client.find({
      deleted: false,
      $or: [
        { firstName: { $in: [new RegExp(search, 'i')] } },
        { lastName: { $in: [new RegExp(search, 'i')] } },
        { businessName: { $in: [new RegExp(search, 'i')] } },
        { email: { $in: [new RegExp(search, 'i')] } },
        { phone: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .populate('trucks stores depositHistory.depositedBy')
      .limit(limit || Number.MAX_SAFE_INTEGER);

    if (!clients) throw new Error('¡No ha sido posible cargar los clientes!');

    return clients;
  }),
  clientsPendingTicketsToBill: authenticated(async () => {
    const clients = await Ticket.aggregate([
      {
        $match: {
          turn: { $exists: true },
          totalPrice: { $exists: true },
          outTruckImage: { $exists: true },
          isBilled: false,
          disabled: false
        }
      },
      { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
      {
        $group: { _id: '$client', count: { $sum: 1 } }
      },
      { $project: { _id: 0, client: '$_id', count: '$count' } }
    ]);

    for (let i = 0; i < clients.length; i++) {
      const client = {
        client: clients[i].client[0],
        count: clients[i].count
      };

      client.client.id = client.client._id;
      delete client.client._id;

      clients[i] = { ...client };
    }

    if (!clients) throw new Error('¡No ha sido posible cargar los clientes!');

    return clients;
  }),
  clientsXLS: authenticated(async (_, { filters: { limit, search } }) => {
    const rocks = await Rock.find({});
    const clients = await Client.find({
      deleted: false,
      $or: [
        { firstName: { $in: [new RegExp(search, 'i')] } },
        { lastName: { $in: [new RegExp(search, 'i')] } },
        { businessName: { $in: [new RegExp(search, 'i')] } },
        { email: { $in: [new RegExp(search, 'i')] } },
        { phone: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .populate('prices.rock trucks stores')
      .limit(limit || Number.MAX_SAFE_INTEGER);

    if (!clients) throw new Error('¡No ha sido posible cargar los clientes!');

    const attributes = [
      {
        header: 'ID',
        key: 'uniqueId'
      },
      {
        header: 'Negocio',
        key: 'businessName'
      },
      {
        header: 'Nombre(s)',
        key: 'firstName'
      },
      {
        header: 'Apellido(s)',
        key: 'lastName'
      },
      {
        header: 'Email',
        key: 'email'
      },
      {
        header: 'Celular(es)',
        key: 'cellphone'
      }
    ];

    rocks.forEach(({ name }) => {
      attributes.push({ header: name, key: name });
    });

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'GEMSA';
    workbook.lastModifiedBy = 'GEMSA';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet('Clientes');
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    worksheet.columns = attributes;
    worksheet.columns.forEach(column => {
      // eslint-disable-next-line no-param-reassign
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];

      const pricesPerRockPromise = rocks.map(({ id }) =>
        ClientPrice.find({ rock: id, client: client.id })
          .populate('rock')
          .sort({ addedAt: 'descending' })
      );

      // eslint-disable-next-line no-await-in-loop
      const pricesPerRock = await Promise.all(pricesPerRockPromise);
      const filteredPricesPerRock = pricesPerRock
        .map(rockPrices => rockPrices[0])
        .filter(price => price && !price.noSpecialPrice);

      const row = {};
      attributes.forEach(({ key }) => {
        row[key] = client[key];
      });

      filteredPricesPerRock.forEach(({ rock: { name }, price }) => {
        row[name] = price;
      });

      row.cellphone = row.cellphone.join(', ');

      worksheet.addRow(row);
    }

    const firstRow = worksheet.getRow(1);
    firstRow.font = {
      size: 12,
      bold: true
    };
    firstRow.alignment = { vertical: 'middle' };
    firstRow.height = 20;

    const buffer = await workbook.xlsx.writeBuffer();
    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  }),
  clientsSummary: authenticated(
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
    }
  )
};

export default clientQueries;
