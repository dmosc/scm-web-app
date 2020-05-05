import { ApolloError } from 'apollo-server';
import { ClientsGroup, Promotion, Ticket } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const promotionQueries = {
  promotion: authenticated(async (_, args) => {
    const { id } = args;
    const promotion = await Promotion.findById(id);

    if (!promotion) throw new Error('¡No se ha podido encontrar la promocion!');

    return promotion;
  }),
  promotions: authenticated(async (_, { filters: { limit, status } }) => {
    const query = {};

    if (status === 'ACTIVE' || status === 'INACTIVE') {
      query.deleted = false;
      query.disabled = status === 'INACTIVE';

      query.$or = [
        {
          $and: [
            // Promos that don't have restrictions
            {
              $and: [{ start: { $exists: false } }, { end: { $exists: false } }]
            },
            {
              $and: [{ limit: { $exists: false } }, { currentLimit: { $exists: false } }]
            }
          ]
        },
        {
          $and: [
            // Promos that only have date range
            {
              $and: [{ limit: { $exists: false } }, { currentLimit: { $exists: false } }]
            },
            {
              $and: [{ end: { $exists: true } }, { end: { $gte: Date.now() } }]
            }
          ]
        },
        {
          $and: [
            // Promos that only have tons limit
            {
              $and: [{ start: { $exists: false } }, { end: { $exists: false } }]
            },
            {
              $and: [
                { limit: { $exists: true } },
                { currentLimit: { $exists: true } },
                { $expr: { $gt: ['$limit', '$currentLimit'] } }
              ]
            }
          ]
        },
        {
          $and: [
            // Promos that have both restrictions
            {
              $and: [
                { start: { $exists: true } },
                { end: { $exists: true } },
                { end: { $gte: Date.now() } }
              ]
            },
            {
              $and: [
                { limit: { $exists: true } },
                { currentLimit: { $exists: true } },
                { $expr: { $gt: ['$limit', '$currentLimit'] } }
              ]
            }
          ]
        }
      ];
    } else if (status === 'ARCHIVED') {
      query.$or = [
        {
          $and: [
            // Promos that only have date range
            {
              $and: [{ limit: { $exists: false } }, { currentLimit: { $exists: false } }]
            },
            {
              $and: [{ end: { $exists: true } }, { end: { $lt: Date.now() } }]
            }
          ]
        },
        {
          $and: [
            // Promos that only have tons limit
            {
              $and: [{ start: { $exists: false } }, { end: { $exists: false } }]
            },
            {
              $and: [
                { limit: { $exists: true } },
                { currentLimit: { $exists: true } },
                { $expr: { $lte: ['$limit', '$currentLimit'] } }
              ]
            }
          ]
        },
        {
          $or: [
            // Promos that have both restrictions
            {
              $and: [
                { start: { $exists: true } },
                { end: { $exists: true } },
                { end: { $lt: Date.now() } }
              ]
            },
            {
              $and: [
                { limit: { $exists: true } },
                { currentLimit: { $exists: true } },
                { $expr: { $lte: ['$limit', '$currentLimit'] } }
              ]
            }
          ]
        }
      ];
    }

    const promotions = await Promotion.find(query)
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('product.rock clients groups createdBy');

    if (!promotions) throw new ApolloError('¡No ha sido posible cargar las promociones!');
    else return promotions;
  }),
  promotionsForTicket: authenticated(async (_, args) => {
    const ticket = await Ticket.findById(args.ticket);
    const groups = await ClientsGroup.find({ clients: ticket.client });

    const eligibleClients = {
      $or: [
        { clients: { $exists: false } },
        { clients: { $size: 0 } },
        { clients: ticket.client },
        { groups }
      ]
    };

    const query = {
      deleted: false,
      disabled: false,
      'product.rock': ticket.product,
      $or: [
        {
          $and: [
            // Promos with no restrictions
            { limit: { $exists: false } },
            { currentLimit: { $exists: false } },
            { start: { $exists: false } },
            { end: { $exists: false } },
            eligibleClients
          ]
        },
        {
          $and: [
            // Promos that only have date range
            { limit: { $exists: false } },
            { currentLimit: { $exists: false } },
            { end: { $exists: true } },
            { end: { $gt: Date.now() } },
            eligibleClients
          ]
        },
        {
          $and: [
            // Promos that only have tons limit
            { start: { $exists: false } },
            { end: { $exists: false } },
            { limit: { $exists: true } },
            { currentLimit: { $exists: true } },
            { $expr: { $lte: ['$limit', '$currentLimit'] } },
            eligibleClients
          ]
        },
        {
          $and: [
            // Promos with both restrictions
            { start: { $exists: true } },
            { end: { $exists: true } },
            { end: { $gt: Date.now() } },
            { limit: { $exists: true } },
            { currentLimit: { $exists: true } },
            { $expr: { $lte: ['$limit', '$currentLimit'] } },
            eligibleClients
          ]
        }
      ]
    };

    const promotions = await Promotion.find(query).populate(
      'product.rock clients groups createdBy'
    );

    if (!promotions) throw new ApolloError('¡No ha sido posible cargar las promociones!');
    else return promotions;
  })
};

export default promotionQueries;
