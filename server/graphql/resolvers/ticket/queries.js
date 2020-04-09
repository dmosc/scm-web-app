import { ApolloError } from 'apollo-server';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Types } from 'mongoose';
import { ClientPrice, Ticket } from '../../../mongo-db/models';
import { Ticket as ArchiveTicket } from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const ticketQueries = {
  ticket: authenticated(async (_, args) => {
    const { id } = args;
    const ticket = await Ticket.findById(id).populate([
      {
        path: 'client truck product turn',
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
          path: 'client truck product turn',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

    if (!tickets) throw new ApolloError('¡Ha habido un error cargando los tickets!');
    else return tickets;
  }),
  activeTickets: authenticated(async (_, { filters: { limit } }) => {
    const activeTickets = await Ticket.find({ disabled: false, turn: { $exists: false } })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate([
        {
          path: 'client truck product turn store',
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
            path: 'client truck product turn store',
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
          path: 'client truck product turn store',
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
          path: 'client truck product turn store',
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
        path: 'client truck product turn store',
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
      const specialPrice = await ClientPrice.find({ client, rock: product[0].id }).sort({
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
  )
};

export default ticketQueries;
