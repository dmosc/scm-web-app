import { ApolloError } from 'apollo-server';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Types } from 'mongoose';
import moment from 'moment';
import { format } from '../../../../src/utils/functions';
import { createWorkbook, createWorksheet } from '../../../utils/reports';
import { ClientPrice, Ticket } from '../../../mongo-db/models';
import { Ticket as ArchiveTicket } from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';
import { createPDF } from '../../../utils/pdfs';

const ticketQueries = {
  ticket: authenticated(async (_, args) => {
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
  ticketPDF: async (_, { id }) => {
    const ticket = await Ticket.findOne({ _id: id }).populate(
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
  ticketsToBillSummary: authenticated(async (_, { tickets: ticketIds, client }) => {
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
          tax: { $sum: '$tax' },
          total: { $sum: '$totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          product: '$_id',
          weight: '$totalWeight',
          subtotal: '$subtotal',
          tax: '$tax',
          total: '$total'
        }
      }
    ]);

    const products = [];
    let subtotal = 0;
    let tax = 0;
    let total = 0;
    let price;

    for (let i = 0; i < productSummary.length; i++) {
      const {
        product,
        weight,
        subtotal: productSubtotal,
        tax: productTax,
        total: productTotal
      } = productSummary[i];

      // eslint-disable-next-line no-await-in-loop
      const specialPrice = await ClientPrice.find({ client, rock: product[0]._id }).sort({
        addedAt: 'descending'
      });

      if (!specialPrice[0] || specialPrice[0].noSpecialPrice) price = product[0].price;
      else price = specialPrice[0].price;

      subtotal += productSubtotal;
      tax += productTax;
      total += productTotal;

      products.push({ product: product[0], price, weight, total: productTotal });
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
  )
};

export default ticketQueries;
