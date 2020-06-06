/* eslint-disable no-param-reassign */
import { ApolloError } from 'apollo-server';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { format, list } from '../../../../src/utils/functions';
import {
  columnToLetter,
  createWorkbook,
  createWorksheet,
  headerRows,
  solidFill
} from '../../../utils/reports';
import { ClientPrice, Rock, Ticket } from '../../../mongo-db/models';
import { Ticket as ArchiveTicket } from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';
import { createPDF } from '../../../utils/pdfs';

const ticketQueries = {
  ticket: authenticated(async (_, { args }) => {
    const { id } = args;
    const ticket = await Ticket.findById(id).populate([
      {
        path: 'client truck product turn promotion',
        populate: {
          path: 'stores',
          model: 'Store'
        }
      }
    ]);

    if (!ticket) throw new Error('¡No ha sido posible encontrar el ticket!');

    return ticket;
  }),
  tickets: authenticated(async (_, { filters: { limit } }) => {
    const tickets = await Ticket.find({})
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
  ticketPDF: async (_, { idOrFolio }) => {
    const query = {};

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
    const activeTickets = await Ticket.find({ disabled: false, turn: { $exists: false } })
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
  ticketsToBillSummary: authenticated(async (_, { tickets: ticketIds, client, turnToBill }) => {
    const productSummary = await Ticket.aggregate([
      {
        $match: {
          _id: { $in: [...ticketIds.map(ticket => Types.ObjectId(ticket))] },
          turn: { $exists: true },
          isBilled: false,
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

      // eslint-disable-next-line no-await-in-loop
      const specialPrice = await ClientPrice.find({ client, rock: product[0]._id }).sort({
        addedAt: 'descending'
      });

      if (!specialPrice[0] || specialPrice[0].noSpecialPrice) price = product[0].price;
      else price = specialPrice[0].price;

      const subtotalToAdd = turnToBill ? productSubtotal / 1.16 : productSubtotal;
      const taxToAdd = turnToBill ? subtotalToAdd * 0.16 : productTax;

      price = turnToBill ? (subtotalToAdd / weight).toFixed(2) : price;

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
      { range = {}, turnId, billType, paymentType, productId, clientIds, truckId, folio }
    ) => {
      const query = {
        out: {
          $gte: new Date(range.start || '1970-01-01T00:00:00.000Z'),
          $lte: new Date(range.end || '2100-12-31T00:00:00.000Z')
        },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true }
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

      return Ticket.find(query).populate('client product truck');
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
  ticketsSummary: authenticated(
    async (
      _,
      {
        range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
        turnId,
        billType,
        paymentType
      }
    ) => {
      const $match = {
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
    }
  ),
  ticketsSummaryByClientXLS: authenticated(
    async (
      _,
      {
        range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
        turnId,
        billType,
        paymentType
      }
    ) => {
      const $match = {
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
          title: `Boletas filtradas del ${moment(range.start).format('lll')} al ${moment(
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
          subtotal: `${format.currency(subtotal)}`,
          tax: `${format.currency(tax)}`,
          totalPrice: `${format.currency(totalPrice)}`
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
  ),
  ticketsSummaryByDateXLS: authenticated(
    async (
      _,
      {
        range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
        turnId,
        billType,
        paymentType
      }
    ) => {
      const query = {
        out: { $gte: new Date(range.start), $lte: new Date(range.end) },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true }
      };

      if (turnId) {
        query.turn = turnId;
      }

      if (billType) {
        if (billType === 'BILL') query.tax = { $gt: 0 };
        if (billType === 'REMISSION') query.tax = { $eq: 0 };
      }

      if (paymentType) {
        if (paymentType === 'CASH') query.credit = false;
        if (paymentType === 'CREDIT') query.credit = true;
      }

      const tickets = await Ticket.find(query).populate('client product truck');

      const attributes = [
        {
          header: 'Folio',
          key: 'folio'
        },
        {
          header: 'Fecha',
          key: 'out'
        },
        {
          header: 'Cliente',
          key: 'businessName'
        },
        {
          header: 'Camión',
          key: 'plates'
        },
        {
          header: 'Producto',
          key: 'product'
        },
        {
          header: 'Peso',
          key: 'totalWeight'
        },
        {
          header: 'Importe Producto',
          key: 'subtotal'
        },
        {
          header: 'Impuesto',
          key: 'tax'
        },
        {
          header: 'Importe',
          key: 'totalPrice'
        },
        {
          header: 'Tipo de pago',
          key: 'credit'
        },
        {
          header: 'Status',
          key: 'status'
        }
      ];

      for (let i = 0; i < attributes.length; i++) attributes[i] = { ...attributes[i], width: 15 };

      const workbook = createWorkbook();

      const worksheet = createWorksheet(
        workbook,
        {
          name: 'BoletasFecha',
          columns: attributes,
          date: new Date(),
          title: `Boletas por fecha del ${moment(range.start).format('lll')} al ${moment(
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

      tickets.forEach(ticket => {
        const ticketRow = {
          folio: ticket.folio,
          out: moment(ticket.out).format('LLL'),
          businessName: ticket.client.businessName,
          plates: ticket.truck.plates,
          product: ticket.product.name,
          totalWeight: format.number(ticket.totalWeight),
          subtotal: format.number(ticket.totalPrice - ticket.tax),
          tax: format.number(ticket.tax || 0),
          totalPrice: format.number(ticket.totalPrice),
          credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
          status: !ticket.isBilled ? '<Por facturar>' : ticket.tax ? '<Remisionada>' : '<Facturada>'
        };

        sums.product++;
        sums.totalWeight += ticket.totalWeight;
        sums.subtotal += ticket.totalPrice - (ticket.tax || 0);
        sums.tax += ticket.tax || 0;
        sums.totalPrice += ticket.totalPrice;

        worksheet.addRow(ticketRow);
      });

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

      const buffer = await workbook.xlsx.writeBuffer();

      return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
        'base64'
      )}`;
    }
  ),
  ticketsAuxiliarySalesXLS: async (
    _,
    { month = moment(), workingDays, workingDaysPassed, excluded = [] }
  ) => {
    const $match = {
      out: {
        $gte: new Date(moment(month)?.startOf('month')),
        $lte: new Date(moment(month).endOf('month'))
      },
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true }
    };

    const [
      excludedProducts,
      products,
      byRockAndDay,
      byDay,
      excludedByDay,
      notExcludedByDay,
      byRock,
      totals,
      excludedTotals,
      notExcludedTotals
    ] = await Promise.all([
      // Get excluded rocks to list them
      Rock.find({ _id: { $in: excluded } }),
      // Get all rocks to reconstruct columns
      Rock.find(),
      // Get totalWeight by rock and for each day of the month
      Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
              rock: '$product'
            },
            totalWeight: { $sum: '$totalWeight' }
          }
        }
      ]),
      // Get totalWeight and total sales of every product by day of the month
      Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get totalWeight and total sales of excluded products by day of the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $in: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get totalWeight and total sales of not excluded products by day of the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $nin: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get totalWeight by rock
      Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: '$product',
            totalWeight: { $sum: '$totalWeight' }
          }
        }
      ]),
      // Get total weight and total asles for every product in the month
      Ticket.aggregate([
        {
          $match
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get total weight and total asles for every product in the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $in: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get total weight and total asles for every product in the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $nin: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ])
    ]);

    // IDK Why but sometimes this aggregate array its empty when no data.
    // This is just to prevent formulaes to explode :v
    if (notExcludedTotals.length === 0) {
      notExcludedTotals.push({
        _id: null,
        totalWeight: 0,
        total: 0
      });
    }

    if (excludedTotals.length === 0) {
      excludedTotals.push({
        _id: null,
        totalWeight: 0,
        total: 0
      });
    }

    const workbook = createWorkbook();

    const rockColumns = products.map(({ name }) => ({ header: name, key: name }));

    const columns = [
      {
        header: 'DIA',
        key: 'day',
        width: 15
      },
      ...rockColumns,
      {
        header: 'TOTAL TON',
        key: 'totalWeight',
        width: 15
      },
      {
        header: 'VENTAS NETAS',
        key: 'netSales',
        width: 15
      },
      {
        header: 'PRECIO PROMEDIO',
        key: 'avgPrice',
        width: 15
      },
      {
        header: 'TOTAL M3',
        key: 'totalM3',
        width: 15
      },
      {
        header: 'TON LIMPIAS *',
        key: 'totalWeightNotExcluded',
        width: 15
      },
      {
        header: 'IMPORTE LIMPIO *',
        key: 'netSalesNotExcluded',
        width: 15
      },
      {
        header: 'PRECIO PROMEDIO LIMPIO *',
        key: 'avgPriceNotExcluded',
        width: 15
      },
      {
        header: 'TON SUCIAS *',
        key: 'totalWeightExcluded',
        width: 15
      },
      {
        header: 'IMPORTE SUCIAS *',
        key: 'netSalesExcluded',
        width: 15
      },
      {
        header: 'PRECIO PROMEDIO SUCIO *',
        key: 'avgPriceExcluded',
        width: 15
      }
    ];

    const worksheet = createWorksheet(
      workbook,
      {
        name: 'AuxiliarVentas',
        columns,
        date: new Date(),
        title: `Auxiliar de ventas de ${moment(month).format('MMMM Y')}`
      },
      {
        pageSetup: { fitToPage: true, orientation: 'landscape' }
      }
    );

    // Style title
    const titleRow = worksheet.getRow(headerRows);
    titleRow.height = 25;
    titleRow.eachCell((cell, colNumber) => {
      if (colNumber < 2 || colNumber >= worksheet.getColumn('netSales').number) {
        cell.fill = solidFill('C0C0C0');
      } else {
        cell.fill = solidFill('FFFF99');
      }
      cell.alignment = { wrapText: true, horizontal: 'center' };
    });

    const dayRows = [];
    for (let i = 0; i < moment(month).daysInMonth(); i++) dayRows.push({});

    byRockAndDay.forEach(({ _id, totalWeight }) => {
      dayRows[_id.day - 1][_id.rock[0].name] = totalWeight;
    });

    byDay.forEach(({ _id: day, total, totalWeight }) => {
      dayRows[day - 1].totalWeight = totalWeight;
      dayRows[day - 1].netSales = total;
      dayRows[day - 1].totalM3 = totalWeight ? totalWeight / 1.52 : undefined;
      dayRows[day - 1].avgPrice = total / totalWeight;
    });

    excludedByDay.forEach(({ _id: day, total, totalWeight }) => {
      dayRows[day - 1].totalWeightExcluded = totalWeight;
      dayRows[day - 1].netSalesExcluded = total;
      dayRows[day - 1].avgPriceExcluded = total / totalWeight;
    });

    notExcludedByDay.forEach(({ _id: day, total, totalWeight }) => {
      dayRows[day - 1].totalWeightNotExcluded = totalWeight;
      dayRows[day - 1].netSalesNotExcluded = total;
      dayRows[day - 1].avgPriceNotExcluded = total / totalWeight;
    });

    dayRows.forEach((row, index) => {
      worksheet.addRow({ ...row, day: index + 1 });
    });

    // Get important columns
    const lastProductCellLetter = columnToLetter(worksheet.getColumn('totalWeight').number - 1);
    const totalWeightCellLetter = columnToLetter(worksheet.getColumn('totalWeight').number);
    const totalWeightExcludedCellLetter = columnToLetter(
      worksheet.getColumn('totalWeightExcluded').number
    );
    const totalWeightNotExcludedCellLetter = columnToLetter(
      worksheet.getColumn('totalWeightNotExcluded').number
    );
    const netSalesCellLetter = columnToLetter(worksheet.getColumn('netSales').number);
    const netSalesExcludedCellLetter = columnToLetter(
      worksheet.getColumn('netSalesExcluded').number
    );
    const netSalesNotExcludedCellLetter = columnToLetter(
      worksheet.getColumn('netSalesNotExcluded').number
    );
    const avgPriceCellLetter = columnToLetter(worksheet.getColumn('avgPrice').number);

    // Calculate total formulaes
    worksheet.eachRow(row => {
      // Less than 7 is header
      if (row.number > headerRows) {
        const totalWeightCell = row.getCell('totalWeight');
        const netSalesCell = row.getCell('netSales');
        const avgPriceCell = row.getCell('avgPrice');
        const totalM3Cell = row.getCell('totalM3');

        if (totalWeightCell.value) {
          avgPriceCell.value = {
            formula: `${netSalesCellLetter}${row.number}/${totalWeightCellLetter}${row.number}`,
            result: netSalesCell.value / totalWeightCell.value
          };
          totalWeightCell.value = {
            // Will always be B since A is for Days
            formula: `SUMA(B${row.number}:${lastProductCellLetter}${row.number})`,
            result: totalWeightCell.value || 0
          };
          totalM3Cell.value = {
            formula: `${totalWeightCellLetter}${row.number}/1.52`,
            result: totalM3Cell.value || 0
          };
        }
      }
    });

    // Add accumulated row
    const accumulatedRow = {
      day: 'ACUMULADO'
    };

    byRock.forEach(({ _id, totalWeight }) => {
      accumulatedRow[_id[0].name] = totalWeight;
    });

    accumulatedRow.totalWeight = totals[0].totalWeight;
    accumulatedRow.totalWeightExcluded = excludedTotals[0].totalWeight;
    accumulatedRow.totalWeightNotExcluded = notExcludedTotals[0].totalWeight;
    accumulatedRow.totalM3 = totals[0].totalWeight / 1.52;
    accumulatedRow.netSales = totals[0].total;
    accumulatedRow.netSalesExcluded = excludedTotals[0].total;
    accumulatedRow.netSalesNotExcluded = notExcludedTotals[0].total;

    worksheet.addRow(accumulatedRow);

    const parsedAccumulatedRow = worksheet.getRow(worksheet.rowCount);

    // Add forecast row
    const forecastRow = {
      day: 'TENDENCIA'
    };
    byRock.forEach(({ _id, totalWeight }) => {
      forecastRow[_id[0].name] = (totalWeight / workingDaysPassed) * workingDays;
    });

    forecastRow.totalWeight = (totals[0].totalWeight / workingDaysPassed) * workingDays;
    forecastRow.totalWeightExcluded =
      (excludedTotals[0].totalWeight / workingDaysPassed) * workingDays;
    forecastRow.totalWeightNotExcluded =
      (notExcludedTotals[0].totalWeight / workingDaysPassed) * workingDays;
    forecastRow.totalM3 = (totals[0].totalWeight / 1.52 / workingDaysPassed) * workingDays;
    forecastRow.netSales = (totals[0].total / workingDaysPassed) * workingDays;
    forecastRow.netSalesExcluded = (excludedTotals[0].total / workingDaysPassed) * workingDays;
    forecastRow.netSalesNotExcluded =
      (notExcludedTotals[0].total / workingDaysPassed) * workingDays;
    forecastRow.avgPrice = forecastRow.netSales / forecastRow.totalWeight;
    forecastRow.avgPriceExcluded = forecastRow.netSalesExcluded / forecastRow.totalWeightExcluded;
    forecastRow.avgPriceNotExcluded =
      forecastRow.netSalesNotExcluded / forecastRow.totalWeightNotExcluded;

    worksheet.addRow(forecastRow);

    const parsedForecastRow = worksheet.getRow(worksheet.rowCount);

    // Add percentage row
    const percentageRow = {
      day: '% Producto'
    };

    byRock.forEach(({ _id }) => {
      percentageRow[_id[0].name] = forecastRow[_id[0].name] / forecastRow.totalWeight;
    });

    percentageRow.totalWeight = forecastRow.totalWeight / forecastRow.totalWeight;
    percentageRow.totalWeightExcluded = forecastRow.totalWeightExcluded / forecastRow.totalWeight;
    percentageRow.totalWeightNotExcluded =
      forecastRow.totalWeightNotExcluded / forecastRow.totalWeight;
    percentageRow.totalWeight = forecastRow.totalWeight / forecastRow.totalWeight;
    percentageRow.netSales = forecastRow.netSales / forecastRow.netSales;
    percentageRow.netSalesExcluded = forecastRow.netSalesExcluded / forecastRow.netSales;
    percentageRow.netSalesNotExcluded = forecastRow.netSalesNotExcluded / forecastRow.netSales;

    worksheet.addRow(percentageRow);

    const parsedPercentageRow = worksheet.getRow(worksheet.rowCount);

    worksheet.addRow({});

    // Add reference day cells
    worksheet.addRow({
      day: `* Los productos excluídos (sucios) son: ${list(
        excludedProducts.map(({ name }) => name)
      )}`,
      totalWeight: 'Días transcurridos hábiles (efectivos)',
      avgPrice: workingDaysPassed
    });

    const workingDaysPassedRow = worksheet.getRow(worksheet.rowCount);
    workingDaysPassedRow.getCell('avgPrice').fill = solidFill('FF6600');

    worksheet.addRow({
      totalWeight: 'Días hábiles del mes',
      avgPrice: workingDays
    });

    const workingDaysRow = worksheet.getRow(worksheet.rowCount);
    workingDaysRow.getCell('avgPrice').fill = solidFill('FF6600');

    worksheet.addRow({});

    // Add global indicators
    worksheet.addRow({
      totalWeight: 'Promedio Vta Diaria',
      avgPrice: totals[0].totalWeight / workingDaysPassed
    });

    const dailyAvgSalesRow = worksheet.getRow(worksheet.rowCount);
    const dailyAvgSalesCell = dailyAvgSalesRow.getCell('avgPrice');
    dailyAvgSalesCell.fill = solidFill('CCFFFF');
    dailyAvgSalesCell.value = {
      formula: `${totalWeightCellLetter}${parsedAccumulatedRow.number}/${avgPriceCellLetter}${workingDaysPassedRow.number}`,
      value: dailyAvgSalesCell.value
    };

    worksheet.addRow({
      totalWeight: 'Tendencia Vta',
      avgPrice: (totals[0].totalWeight / workingDaysPassed) * workingDays
    });

    const salesForecastRow = worksheet.getRow(worksheet.rowCount);
    const salesForecastCell = salesForecastRow.getCell('avgPrice');
    salesForecastCell.fill = solidFill('CCFFFF');
    salesForecastCell.value = {
      formula: `${avgPriceCellLetter}${dailyAvgSalesRow.number}*${avgPriceCellLetter}${workingDaysRow.number}`,
      value: salesForecastCell.value
    };

    worksheet.addRow({
      totalWeight: 'Promedio $$ Diario',
      avgPrice: forecastRow.netSales / workingDays
    });

    const dailyAvgMoneyRow = worksheet.getRow(worksheet.rowCount);
    const dailyAvgMoneyCell = dailyAvgMoneyRow.getCell('avgPrice');
    dailyAvgMoneyCell.fill = solidFill('CCFFFF');
    dailyAvgMoneyCell.value = {
      formula: `${netSalesCellLetter}${parsedForecastRow.number}/${avgPriceCellLetter}${workingDaysRow.number}`,
      value: dailyAvgMoneyCell.value
    };

    worksheet.addRow({
      totalWeight: 'Tendencia en pesos $$',
      avgPrice: (forecastRow.netSales / workingDays) * workingDays
    });

    const forecastInMoneyRow = worksheet.getRow(worksheet.rowCount);
    const forecastInMoneyCell = forecastInMoneyRow.getCell('avgPrice');
    forecastInMoneyCell.fill = solidFill('CCFFFF');
    forecastInMoneyCell.value = {
      formula: `${avgPriceCellLetter}${dailyAvgMoneyRow.number}*${avgPriceCellLetter}${workingDaysRow.number}`,
      value: forecastInMoneyCell.value
    };

    // Style accumulated row and generate formulaes
    for (let column = 1; column <= worksheet.columnCount; column++) {
      const cell = parsedAccumulatedRow.getCell(column);
      cell.fill = solidFill('FFFF99');
      if (column > 1 && cell.value) {
        cell.value = {
          formula: `SUMA(${columnToLetter(column)}${headerRows + 1}:${columnToLetter(
            column
          )}${headerRows + moment(month).daysInMonth()})`,
          result: cell.value || 0
        };
      }
    }

    const accumulatedAvgPrice = parsedAccumulatedRow.getCell('avgPrice');
    const accumulatedAvgPriceExcluded = parsedAccumulatedRow.getCell('avgPriceExcluded');
    const accumulatedAvgPriceNotExcluded = parsedAccumulatedRow.getCell('avgPriceNotExcluded');
    accumulatedAvgPrice.value = {
      formula: `${netSalesCellLetter}${parsedAccumulatedRow.number}/${totalWeightCellLetter}${parsedAccumulatedRow.number}`,
      result: accumulatedAvgPrice.value
    };
    accumulatedAvgPriceExcluded.value = {
      formula: `${netSalesExcludedCellLetter}${parsedAccumulatedRow.number}/${totalWeightExcludedCellLetter}${parsedAccumulatedRow.number}`,
      result: accumulatedAvgPriceExcluded.value
    };
    accumulatedAvgPriceNotExcluded.value = {
      formula: `${netSalesNotExcludedCellLetter}${parsedAccumulatedRow.number}/${totalWeightNotExcludedCellLetter}${parsedAccumulatedRow.number}`,
      result: accumulatedAvgPriceNotExcluded.value
    };

    // Style forecast row and generate formulaes
    const workingDaysPassedRowNumber = workingDaysPassedRow.number;
    const workingDaysRowNumber = workingDaysRow.number;
    for (let column = 1; column <= worksheet.columnCount; column++) {
      const cell = parsedForecastRow.getCell(column);
      cell.fill = solidFill('FFFF99');
      cell.font = { bold: true };

      if (column > 1 && cell.value) {
        if (column === worksheet.getColumn('avgPrice').number) {
          cell.value = {
            formula: `${netSalesCellLetter}${parsedForecastRow.number}/${totalWeightCellLetter}${parsedForecastRow.number}`,
            result: cell.value || 0
          };
        } else if (column === worksheet.getColumn('avgPriceExcluded').number) {
          cell.value = {
            formula: `${netSalesExcludedCellLetter}${parsedForecastRow.number}/${totalWeightExcludedCellLetter}${parsedForecastRow.number}`,
            result: cell.value || 0
          };
        } else if (column === worksheet.getColumn('avgPriceNotExcluded').number) {
          cell.value = {
            formula: `${netSalesNotExcludedCellLetter}${parsedForecastRow.number}/${totalWeightNotExcludedCellLetter}${parsedForecastRow.number}`,
            result: cell.value || 0
          };
        } else {
          cell.value = {
            formula: `${columnToLetter(column)}${
              parsedAccumulatedRow.number
            }/$${avgPriceCellLetter}$${workingDaysPassedRowNumber}*$${avgPriceCellLetter}$${workingDaysRowNumber}`,
            result: cell.value || 0
          };
        }
      }
    }

    // Style percentage row and generate formulaes
    for (let column = 1; column <= worksheet.columnCount; column++) {
      const cell = parsedPercentageRow.getCell(column);
      cell.fill = solidFill('FFFF99');
      if (column > 1 && cell.value) {
        cell.value = {
          formula: `$${columnToLetter(column)}${
            parsedForecastRow.number
          }/${totalWeightCellLetter}$${parsedForecastRow.number}`,
          result: cell.value || 0
        };
      }
    }

    const percentageNetSalesCell = parsedPercentageRow.getCell('netSales');
    const percentageNetSalesExcludedCell = parsedPercentageRow.getCell('netSalesExcluded');
    const percentageNetSalesNotExcludedCell = parsedPercentageRow.getCell('netSalesNotExcluded');
    percentageNetSalesCell.value = {
      formula: `${netSalesCellLetter}${parsedForecastRow.number}/${netSalesCellLetter}${parsedForecastRow.number}`,
      result: percentageNetSalesCell.value.value
    };
    percentageNetSalesExcludedCell.value = {
      formula: `${netSalesExcludedCellLetter}${parsedForecastRow.number}/${netSalesCellLetter}${parsedForecastRow.number}`,
      result: percentageNetSalesExcludedCell.value.result
    };
    percentageNetSalesNotExcludedCell.value = {
      formula: `${netSalesNotExcludedCellLetter}${parsedForecastRow.number}/${netSalesCellLetter}${parsedForecastRow.number}`,
      result: percentageNetSalesNotExcludedCell.value.result
    };

    // Style the entire sheet
    for (let row = headerRows; row <= worksheet.rowCount; row++) {
      const actualRow = worksheet.getRow(row);
      for (let col = 1; col <= worksheet.columnCount; col++) {
        const cell = actualRow.getCell(col);
        cell.font = { ...cell.font, size: 9 };

        if (row <= worksheet.rowCount - 8) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }

        if (row > headerRows && row <= headerRows + moment(month).daysInMonth()) {
          if (
            col === worksheet.getColumn('totalWeight').number ||
            col === worksheet.getColumn('avgPrice').number ||
            col === worksheet.getColumn('avgPriceExcluded').number ||
            col === worksheet.getColumn('avgPriceNotExcluded').number
          ) {
            cell.fill = solidFill('3366FF');
          } else if (col === worksheet.getColumn('totalM3').number) {
            cell.fill = solidFill('99CC00');
          }
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  }
};

export default ticketQueries;
