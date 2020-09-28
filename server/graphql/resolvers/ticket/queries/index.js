import { ApolloError } from 'apollo-server';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { Ticket } from '../../../../mongo-db/models';
import { Ticket as ArchiveTicket } from '../../../../sequelize-db/models';
import authenticated from '../../../middleware/authenticated';
import { createPDF } from '../../../../utils/pdfs';
import ticketReports from './reports';

const ticketQueries = {
  ticket: authenticated(async (_, args) => {
    const { id } = args;
    const ticket = await Ticket.findById(id)
      .populate(
        'client truck product store promotion usersInvolved.guard usersInvolved.loader usersInvolved.cashier'
      )
      .populate([
        {
          path: 'turn',
          populate: {
            path: 'user'
          }
        }
      ]);

    if (!ticket) throw new Error('¡No ha sido posible encontrar el ticket!');

    return ticket;
  }),
  tickets: authenticated(async (_, { filters: { limit } }) => {
    const tickets = await Ticket.find({ deleted: false, disabled: false })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

    if (!tickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return tickets;
  }),
  ticketsByClient: authenticated(
    async (
      _,
      { clientId, range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' } }
    ) =>
      Ticket.find({
        out: { $gte: new Date(range.start), $lte: new Date(range.end) },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true },
        client: clientId
      }).populate('product')
  ),
  ticketPDF: async (_, { idOrFolio }) => {
    const query = { deleted: false, disabled: false };

    if (Types.ObjectId.isValid(idOrFolio)) {
      query._id = idOrFolio;
    } else {
      query.folio = idOrFolio;
    }

    const ticket = await Ticket.findOne(query).populate(
      'client store product truck usersInvolved.cashier'
    );

    const {
      usersInvolved: { cashier }
    } = ticket;
    const { address } = ticket.client;

    const pdfOptions = {
      content: [
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                '',
                '',
                {
                  table: {
                    body: [
                      [{ text: `Folio: ${ticket.folio}`, fontSize: 16 }],
                      [{ text: moment(ticket.out).format('l LTS'), fontSize: 16 }],
                      [{ text: ticket.credit ? 'Crédito' : 'Contado', fontSize: 16 }],
                      [{ text: `Operador: ${cashier.firstName} ${cashier.lastName}`, fontSize: 16 }]
                    ]
                  },
                  layout: 'noBorders',
                  alignment: 'right'
                }
              ]
            ]
          },
          layout: 'noBorders'
        },
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  table: {
                    headerRows: 1,
                    body: [
                      ['Remisionado'],
                      [ticket.client.businessName],
                      [
                        address.street
                          ? `${address.street} #${address.extNumber} ${address.municipality}, ${address.state}`
                          : 'N/A'
                      ],
                      [{ text: `Placas: ${ticket.truck.plates}`, margin: [0, 20] }]
                    ]
                  },
                  layout: 'headerLineOnly'
                },
                {
                  margin: [30, 0],
                  table: {
                    headerRows: 1,
                    body: [
                      ['Consignado'],
                      [!ticket.store ? 'Matriz' : ticket.store.name],
                      [!ticket.store ? 'Matriz' : ticket.store.address || 'N/A'],
                      [
                        ticket.store
                          ? `${ticket.store.municipality || 'N/A'}, ${ticket.store.state || 'N/A'}`
                          : ''
                      ],
                      [`Peso bruto: ${ticket.weight} tons`],
                      [`Peso del camión: ${ticket.truck.weight} tons`]
                    ]
                  },
                  layout: 'headerLineOnly'
                }
              ]
            ]
          },
          layout: 'noBorders'
        },
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  table: {
                    headerRows: 1,
                    body: [['Producto'], [ticket.product.name]]
                  },
                  layout: 'headerLineOnly'
                },
                {
                  margin: [30, 0],
                  table: {
                    headerRows: 1,
                    body: [['Toneladas'], [ticket.totalWeight]]
                  },
                  layout: 'headerLineOnly'
                }
              ]
            ]
          },
          layout: 'noBorders'
        },
        {
          margin: [0, 10, 0, 0],
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  table: {
                    headerRows: 1,
                    body: [[''], [`${ticket.driver}`]]
                  },
                  layout: 'headerLineOnly'
                },
                {
                  margin: [30, 0],
                  table: {
                    headerRows: 1,
                    body: [[''], ['SUPERVISOR DE ÁREA']]
                  },
                  layout: 'headerLineOnly'
                }
              ]
            ]
          },
          layout: 'noBorders'
        }
      ]
    };

    return createPDF(pdfOptions);
  },
  activeTickets: authenticated(async (_, { filters: { limit } }) => {
    const activeTickets = await Ticket.find({
      deleted: false,
      disabled: false,
      turn: { $exists: false }
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

    if (!activeTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return activeTickets;
  }),
  disabledTickets: authenticated(
    async (
      _,
      { filters: { limit, start = '1970-01-01T00:00:00.000Z', end = '2100-12-31T00:00:00.000Z' } }
    ) => {
      const query = {
        deleted: false,
        disabled: true,
        disabledAt: { $gte: new Date(start), $lte: new Date(end) }
      };

      const disabledTickets = await Ticket.find(query)
        .limit(limit || Number.MAX_SAFE_INTEGER)
        .populate([
          {
            path: 'client truck product turn store promotion',
            populate: {
              path: 'stores',
              model: 'Store'
            }
          }
        ]);

      if (!disabledTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
      else return disabledTickets;
    }
  ),
  notLoadedActiveTickets: authenticated(async (_, { filters: { limit } }) => {
    const activeTickets = await Ticket.find({
      deleted: false,
      disabled: false,
      turn: { $exists: false },
      load: { $exists: false }
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

    if (!activeTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return activeTickets;
  }),
  loadedTickets: authenticated(async (_, { filters: { limit } }) => {
    const loadedTickets = await Ticket.find({
      deleted: false,
      disabled: false,
      turn: { $exists: false },
      load: { $exists: true }
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

    if (!loadedTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return loadedTickets;
  }),
  ticketsPendingToBill: authenticated(async (_, { client, type }) => {
    const ticketsPendingToBill = await Ticket.find({
      client,
      turn: { $exists: true },
      bill: type === 'BILL',
      isBilled: false,
      deleted: false,
      disabled: false
    }).populate([
      {
        path: 'client truck product turn store promotion',
        populate: {
          path: 'stores',
          model: 'Store'
        }
      }
    ]);

    if (!ticketsPendingToBill)
      throw new ApolloError('¡Ha habido un error cargando las boletas por facturar del cliente!');
    else return ticketsPendingToBill;
  }),
  ticketsToBillSummary: authenticated(async (_, { tickets: ticketIds, turnToBill }) => {
    const productSummary = await Ticket.aggregate([
      {
        $match: {
          _id: { $in: [...ticketIds.map(ticket => Types.ObjectId(ticket))] },
          turn: { $exists: true },
          isBilled: false,
          deleted: false,
          disabled: false
        }
      },
      { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
      {
        $group: {
          _id: '$product',
          totalWeight: { $sum: '$totalWeight' },
          subtotal: { $sum: { $subtract: ['$totalPrice', '$tax'] } },
          tax: { $sum: '$tax' }
        }
      },
      {
        $project: {
          _id: 0,
          product: '$_id',
          weight: '$totalWeight',
          subtotal: '$subtotal',
          tax: '$tax'
        }
      }
    ]);

    const products = [];
    let subtotal = 0;
    let tax = 0;
    let total = 0;
    let price;

    for (let i = 0; i < productSummary.length; i++) {
      const { product, weight, subtotal: productSubtotal, tax: productTax } = productSummary[i];

      const subtotalToAdd = turnToBill ? productSubtotal / 1.16 : productSubtotal;
      const taxToAdd = turnToBill ? subtotalToAdd * 0.16 : productTax;

      price = (subtotalToAdd / weight).toFixed(2);

      subtotal += subtotalToAdd;
      tax += taxToAdd;
      total += subtotalToAdd + taxToAdd;

      products.push({ product: product[0], price, weight, total: subtotalToAdd });
    }

    if (!productSummary)
      throw new ApolloError('¡Ha habido un error cargando las boletas por facturar del cliente!');
    else
      return {
        products,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      };
  }),
  archivedTickets: authenticated(
    async (
      _,
      { range = {}, turnId, billType, paymentType, productId, clientIds, truckId, folio, sortBy }
    ) => {
      const query = {
        deleted: false,
        disabled: false,
        out: {
          $gte: new Date(range.start || '1970-01-01T00:00:00.000Z'),
          $lte: new Date(range.end || '2100-12-31T00:00:00.000Z')
        }
      };

      if (folio) query.folio = new RegExp(folio, 'i');
      if (turnId) query.turn = turnId;
      if (clientIds && clientIds.length > 0) query.client = { $in: clientIds };
      if (truckId) query.truck = truckId;
      if (productId) query.product = productId;

      if (billType) {
        if (billType === 'BILL') query.tax = { $gt: 0 };
        if (billType === 'REMISSION') query.tax = { $eq: 0 };
      }

      if (paymentType) {
        if (paymentType === 'CASH') query.credit = false;
        if (paymentType === 'CREDIT') query.credit = true;
      }

      const ticketsPromise = Ticket.find(query).populate('client product truck');

      if (sortBy) {
        const { field, order } = sortBy;
        ticketsPromise.sort({ [field]: order });
      }

      return ticketsPromise;
    }
  ),
  archivedTicketsAurora: authenticated(
    async (
      _,
      { filters: { limit, offset, search: oldSearch, start, end, date, type, product } }
    ) => {
      const search = `%${oldSearch}%`;
      const where = {
        createdAt: {
          [Op.between]: [start || '1970-01-01T00:00:00.000Z', end || '2100-12-31T00:00:00.000Z']
        },
        [Op.or]: [
          { createdAt: date },
          { folio: { [Op.like]: search || '%' } },
          { driver: { [Op.like]: search || '%' } },
          { client: { [Op.like]: search || '%' } },
          { businessName: { [Op.like]: search || '%' } },
          { address: { [Op.like]: search || '%' } },
          { rfc: { [Op.like]: search || '%' } },
          { plates: { [Op.like]: search || '%' } },
          { product: { [Op.like]: search || '%' } }
        ]
      };

      if (type === 'BILL') {
        where.tax = { [Op.ne]: 0 };
      } else if (type === 'REMISSION') {
        where.tax = { [Op.eq]: 0 };
      }

      if (product) {
        where.product = product;
      }

      const archivedTickets = await ArchiveTicket.findAll({
        limit: limit || Number.MAX_SAFE_INTEGER,
        offset: offset || 0,
        where
      });

      if (!archivedTickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
      else return archivedTickets;
    }
  ),
  archivedTicketsXLS: authenticated(
    async (
      _,
      { filters: { limit, offset, search: oldSearch, start, end, date, type, product } }
    ) => {
      const search = `%${oldSearch}%`;

      const attributes = [
        {
          header: 'Folio',
          key: 'folio'
        },
        {
          header: 'Fecha',
          key: 'createdAt'
        },
        {
          header: 'Negocio',
          key: 'businessName',
          width: 25
        },
        {
          header: 'Cliente',
          key: 'client',
          width: 42
        },
        {
          header: 'Dirección',
          key: 'address',
          width: 42
        },
        {
          header: 'RFC',
          key: 'rfc',
          width: 14
        },
        {
          header: 'Conductor',
          key: 'driver',
          width: 50
        },
        {
          header: 'Placas',
          key: 'plates'
        },
        {
          header: 'Foto de entrada',
          key: 'inTruckImage'
        },
        {
          header: 'Foto de salida',
          key: 'outTruckImage'
        },
        {
          header: 'Producto',
          key: 'product'
        },
        {
          header: 'Precio por unidad',
          key: 'price'
        },
        {
          header: 'Peso del camión',
          key: 'truckWeight'
        },
        {
          header: 'Peso bruto',
          key: 'totalWeight'
        },
        {
          header: 'Peso neto',
          key: 'tons'
        },
        {
          header: 'Impuesto',
          key: 'tax'
        },
        {
          header: 'Total',
          key: 'total'
        }
      ];

      const where = {
        createdAt: {
          [Op.between]: [start || '1970-01-01T00:00:00.000Z', end || '2100-12-31T00:00:00.000Z']
        },
        [Op.or]: [
          { createdAt: date },
          { folio: { [Op.like]: search || '%' } },
          { driver: { [Op.like]: search || '%' } },
          { client: { [Op.like]: search || '%' } },
          { businessName: { [Op.like]: search || '%' } },
          { address: { [Op.like]: search || '%' } },
          { rfc: { [Op.like]: search || '%' } },
          { plates: { [Op.like]: search || '%' } },
          { product: { [Op.like]: search || '%' } }
        ]
      };

      if (type === 'BILL') {
        where.tax = { [Op.ne]: 0 };
      } else if (type === 'REMISSION') {
        where.tax = { [Op.eq]: 0 };
      }

      if (product) {
        where.product = product;
      }

      const archivedTickets = await ArchiveTicket.findAll({
        attributes: attributes.map(({ key }) => key),
        limit: limit || Number.MAX_SAFE_INTEGER,
        offset: offset || 0,
        where
      });

      const workbook = new ExcelJS.Workbook();

      workbook.creator = 'GEMSA';
      workbook.lastModifiedBy = 'GEMSA';
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastPrinted = new Date();

      const worksheet = workbook.addWorksheet('Boletas');
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

      worksheet.columns = attributes;

      archivedTickets.forEach(ticket => {
        const row = {};
        attributes.forEach(({ key }) => {
          row[key] = ticket[key];
        });
        worksheet.addRow(row);
      });

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
    }
  ),
  ticketsSummary: async (
    _,
    {
      range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
      turnId,
      billType,
      paymentType
    }
  ) => {
    const $match = {
      deleted: false,
      disabled: false,
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

    if (paymentType) {
      if (paymentType === 'CASH') $match.credit = false;
      if (paymentType === 'CREDIT') $match.credit = true;
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

    if (clients.length === 0)
      return { clients, upfront: 0, credit: 0, total: 0, upfrontWeight: 0, creditWeight: 0 };

    let upfront = 0;
    let credit = 0;
    let total = 0;
    let upfrontWeight = 0;
    let creditWeight = 0;
    for (const client of clients) {
      const { tickets } = client;
      for (const ticket of tickets) {
        if (ticket.credit) {
          credit += ticket.totalPrice - ticket.tax;
          creditWeight += ticket.totalWeight;
        } else {
          upfront += ticket.totalPrice - ticket.tax;
          upfrontWeight += ticket.totalWeight;
        }

        total += ticket.totalPrice - ticket.tax;
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

    return { clients, upfront, credit, total, upfrontWeight, creditWeight };
  },

  ticketTimesSummary: authenticated(async (_, { date = {}, turnId, rocks, folioSearch }) => {
    const $match = {
      deleted: false,
      disabled: false,
      out: {
        $gte: new Date(date.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(date.end || '2100-12-31T00:00:00.000Z')
      },
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true }
    };

    if (turnId) $match.turn = Types.ObjectId(turnId);
    if (rocks && rocks.length > 0)
      $match.product = { $in: rocks.map(rockId => Types.ObjectId(rockId)) };
    if (folioSearch) $match.folio = new RegExp(folioSearch, 'i');

    const tickets = await Ticket.aggregate([
      {
        $match
      },
      {
        $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' }
      },
      {
        $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' }
      },
      {
        $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' }
      },
      {
        $unwind: '$client'
      },
      {
        $unwind: '$truck'
      },
      {
        $unwind: '$product'
      },
      {
        $addFields: {
          id: { $toString: '$_id' },
          'product.id': { $toString: '$product._id' },
          'client.id': { $toString: '$client._id' },
          'truck.id': { $toString: '$truck._id' },
          time: { $subtract: ['$out', '$in'] }
        }
      }
    ]);

    return tickets;
  }),
  ticketTimes: authenticated(async (_, { date = {}, turnId, rocks }) => {
    const $match = {
      deleted: false,
      disabled: false,
      out: {
        $gte: new Date(date.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(date.end || '2100-12-31T00:00:00.000Z')
      },
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true },
      excludeFromTimeMetrics: { $ne: true }
    };

    if (turnId) $match.turn = Types.ObjectId(turnId);
    if (rocks && rocks.length > 0)
      $match.product = { $in: rocks.map(rockId => Types.ObjectId(rockId)) };

    const tickets = await Ticket.aggregate([
      {
        $match
      },
      {
        $group: {
          _id: null,
          minTime: { $min: { $subtract: ['$out', '$in'] } },
          avgTime: { $avg: { $subtract: ['$out', '$in'] } },
          maxTime: { $max: { $subtract: ['$out', '$in'] } }
        }
      }
    ]);

    return {
      max: tickets[0]?.maxTime || 0,
      min: tickets[0]?.minTime || 0,
      avg: parseInt(tickets[0]?.avgTime, 10) || 0
    };
  }),
  ...ticketReports
};

export default ticketQueries;
