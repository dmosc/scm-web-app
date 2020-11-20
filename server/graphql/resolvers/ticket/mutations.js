import { ApolloError } from 'apollo-client';
import Transaction from 'mongoose-transactions';
import {
  Client,
  ClientCreditLimit,
  ClientPrice,
  Folio,
  Promotion,
  Rock,
  Ticket,
  Truck,
  Turn
} from '../../../mongo-db/models';
import uploaders from '../aws/uploaders';
import authenticated from '../../middleware/authenticated';

const TAX = 0.16;

const ticketMutations = {
  ticket: authenticated(async (_, args) => {
    const ticket = new Ticket({ ...args.ticket });

    try {
      await ticket.save();

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketEdit: authenticated(async (_, args, { pubsub }) => {
    const { ticket } = args;

    try {
      const newTicket = await Ticket.findByIdAndUpdate(
        ticket.ticket,
        { ...ticket },
        { new: true }
      ).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
      const activeTickets = await Ticket.find({
        deleted: false,
        disabled: false,
        turn: { $exists: false }
      }).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
      const loadedTickets = await Ticket.find({
        deleted: false,
        disabled: false,
        turn: { $exists: false },
        load: { $exists: true }
      }).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      pubsub.publish('TICKET_UPDATE', { ticketUpdate: ticket });
      pubsub.publish('ACTIVE_TICKETS', { activeTickets });
      pubsub.publish('LOADED_TICKETS', { loadedTickets });

      return newTicket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketInit: authenticated(async (_, args, { req: { userRequesting }, pubsub }) => {
    const transaction = new Transaction();
    const {
      plates,
      product: productId,
      inTruckImage: imageTop,
      inTruckImageLeft: imageLeft,
      inTruckImageRight: imageRight,
      folderKey,
      id
    } = args.ticket;
    const newTicket = new Ticket({ ...args.ticket });

    const ticketExists = await Ticket.aggregate([
      { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
      { $match: { 'truck.plates': plates, turn: { $exists: false }, disabled: false } }
    ]);

    if (ticketExists.length !== 0) throw new Error(`¡El camión ${plates} ya está activo!`);

    try {
      const truck = await Truck.findOne({ plates, client: newTicket.client, deleted: false });
      const product = await Rock.findById(productId);
      const client = await Client.findById(newTicket.client);

      newTicket.client = client.id;
      newTicket.truck = truck.id;
      newTicket.product = product.id;
      newTicket.usersInvolved.guard = userRequesting.id;

      transaction.insert('Ticket', newTicket);
      await transaction.run();

      if (imageTop) {
        newTicket.inTruckImage = await uploaders.imageUpload(_, { image: imageTop, folderKey, id });
      }
      if (imageLeft) {
        newTicket.inTruckImageLeft = await uploaders.imageUpload(_, {
          image: imageLeft,
          folderKey,
          id
        });
      }
      if (imageRight) {
        newTicket.inTruckImageRight = await uploaders.imageUpload(_, {
          image: imageRight,
          folderKey,
          id
        });
      }

      await newTicket.save();

      const ticket = await Ticket.findById(newTicket.id).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
      const activeTickets = await Ticket.find({
        disabled: false,
        deleted: false,
        turn: { $exists: false }
      }).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
      const notLoadedActiveTickets = await Ticket.find({
        disabled: false,
        deleted: false,
        turn: { $exists: false },
        load: { $exists: false }
      }).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      pubsub.publish('ACTIVE_TICKETS', { activeTickets });
      pubsub.publish('NOT_LOADED_ACTIVE_TICKETS', { notLoadedActiveTickets });

      return ticket;
    } catch (e) {
      const transactionError = await transaction.rollback().catch(console.error);
      await transaction.clean();

      return new ApolloError(transactionError);
    }
  }),
  ticketProductLoad: authenticated(async (_, args, { pubsub }) => {
    const { id, outTruckImage, outTruckImageBack } = args.ticket;

    try {
      const newTicket = await Ticket.findOneAndUpdate(
        { _id: id },
        { outTruckImage, outTruckImageBack },
        { new: true }
      );

      const ticket = await Ticket.findById(newTicket.id).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      pubsub.publish('TICKET_UPDATE', { ticketUpdate: ticket });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketProductLoadSetDate: authenticated(async (_, args, { req: { userRequesting }, pubsub }) => {
    const { ticket } = args;

    try {
      const newTicket = await Ticket.findByIdAndUpdate(
        ticket.ticket,
        { load: Date.now(), 'usersInvolved.loader': userRequesting.id },
        { new: true }
      ).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      const loadedTickets = await Ticket.find({
        deleted: false,
        disabled: false,
        turn: { $exists: false },
        load: { $exists: true }
      }).populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      const notLoadedActiveTickets = await Ticket.find({
        deleted: false,
        disabled: false,
        turn: { $exists: false },
        load: { $exists: false }
      }).populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      pubsub.publish('TICKET_UPDATE', { ticketUpdate: newTicket });
      pubsub.publish('LOADED_TICKETS', { loadedTickets });
      pubsub.publish('NOT_LOADED_ACTIVE_TICKETS', { notLoadedActiveTickets });

      return newTicket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketSetStore: authenticated(async (_, args, { pubsub }) => {
    const { ticket, store } = args;

    let update;

    if (!store) update = { $unset: { store: 1 } };
    else update = { store };

    const newTicket = await Ticket.findByIdAndUpdate(ticket, update, { new: true }).populate(
      'client truck product turn store promotion'
    );

    if (!newTicket) throw new Error('No ha sido posible seleccionar la sucursal!');

    pubsub.publish('TICKET_UPDATE', { ticketUpdate: newTicket });

    return true;
  }),
  ticketSubmit: authenticated(async (_, args, { req: { userRequesting }, pubsub }) => {
    const { id, driver, weight, credit, bill, promotion: promotionId, withScale } = args.ticket;

    const newTicket = await Ticket.findOneAndUpdate(
      { _id: id },
      {
        driver: driver.toUpperCase(),
        weight: weight.toFixed(2),
        bill,
        $unset: { promotion: 1 },
        'usersInvolved.cashier': userRequesting.id,
        withScale
      },
      { new: true }
    ).populate('client truck');

    if (!newTicket) throw new Error('¡No ha sido posible encontrar el ticket!');

    const client = await Client.findById(newTicket.client);
    const product = await Rock.findById(newTicket.product);
    await Truck.findOneAndUpdate(
      { _id: newTicket.truck },
      {
        $addToSet: { drivers: newTicket.driver.toUpperCase() }
      },
      { new: true }
    );

    const folio = await Folio.findOneAndUpdate(
      { name: newTicket.bill ? 'A' : 'B' },
      { $inc: { count: 1 } },
      { new: false }
    ).select('name count');

    newTicket.folio = folio.name.toString() + folio.count.toString();
    newTicket.totalWeight = (newTicket.weight - newTicket.truck.weight).toFixed(2);

    let price;
    const specialPrice = await ClientPrice.find({
      client: newTicket.client,
      rock: newTicket.product
    }).sort({
      addedAt: 'descending'
    });

    let promotion;
    if (promotionId) promotion = await Promotion.findById(promotionId);

    if (promotion) {
      price = promotion.product.price;
      newTicket.promotion = promotionId;
      if (promotion.limit) promotion.currentLimit += newTicket.totalWeight;
    } else if (!specialPrice[0] || specialPrice[0].noSpecialPrice) {
      price = product.price;
    } else {
      price = specialPrice[0].price;
    }

    if (newTicket.credit)
      // Recover previous balance from client
      client.balance = (client.balance + newTicket.totalPrice).toFixed(2);

    newTicket.tax = newTicket.bill ? newTicket.totalWeight * price * TAX : 0;
    newTicket.totalPrice = (newTicket.totalWeight * price + newTicket.tax).toFixed(2);

    newTicket.credit = credit;

    if (credit) {
      const clientCreditLimit = await ClientCreditLimit.find({ client: client.id }).sort({
        addedAt: 'descending'
      });
      const creditLimit = clientCreditLimit ? clientCreditLimit.creditLimit : 0;

      const newClientBalance = (client.balance - newTicket.totalPrice).toFixed(2);

      if (newClientBalance * -1 > creditLimit)
        return new Error('¡Esta operación supera el límite de crédito del cliente en su balance!');

      client.balance = newClientBalance;
    }

    if (promotion) await promotion.save();
    await newTicket.save();
    await client.save();

    const ticket = await Ticket.findById(newTicket.id).populate([
      {
        path: 'client truck product turn store promotion',
        populate: {
          path: 'stores',
          model: 'Store'
        }
      }
    ]);

    pubsub.publish('TICKET_UPDATE', { ticketUpdate: ticket });

    return ticket;
  }),
  ticketDisable: async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Ticket.disableById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  },
  ticketEnable: async (_, { id }) => {
    try {
      const ticketToUpdate = await Ticket.findOne({ _id: id }).populate('truck');

      const ticketExists = await Ticket.aggregate([
        { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
        {
          $match: {
            'truck.plates': ticketToUpdate.truck.plates,
            turn: { $exists: false },
            disabled: false
          }
        }
      ]);

      if (ticketExists.length !== 0)
        throw new Error(
          '¡Hay un ticket activo con la misma placa! Para recuperar este necesitas retirar el otro'
        );

      await Ticket.enable({ _id: id });

      return true;
    } catch (e) {
      return e;
    }
  },
  ticketDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const ticket = await Ticket.findById(id);

      if (!ticket) return new Error('No ha sido posible encontrar la boleta!');

      await Turn.findByIdAndUpdate(ticket.turn, { $pull: { folios: ticket.folio } });
      await Ticket.deleteById(id, userRequesting.id);

      return true;
    } catch (e) {
      return e;
    }
  }),
  ticketToBill: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const ticket = await Ticket.findById(id);

      if (!ticket) return new Error('No ha sido posible encontrar la boleta!');
      if (ticket.isBilled)
        return new Error('No se peuden modificar boletas que han sido agrupadas!');

      ticket.bill = true;
      ticket.tax = ticket.totalPrice * TAX;
      ticket.totalPrice += ticket.tax;
      ticket.usersInvolved.modifiedSeries = userRequesting.id;

      const folio = await Folio.findOneAndUpdate(
        { name: ticket.bill ? 'A' : 'B' },
        { $inc: { count: 1 } },
        { new: false }
      ).select('name count');

      const oldFolio = ticket.folio;
      ticket.folio = folio.name.toString() + folio.count.toString();

      await ticket.save();
      await Turn.findByIdAndUpdate(
        ticket.turn,
        {
          $set: { 'folios.$[folio]': ticket.folio } // Remove old folio
        },
        { arrayFilters: [{ folio: oldFolio }] }
      );

      return Ticket.findById(id).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
    } catch (e) {
      return e;
    }
  }),
  ticketToNoBill: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      const ticket = await Ticket.findById(id);

      if (!ticket) return new Error('No ha sido posible encontrar la boleta!');
      if (ticket.isBilled)
        return new Error('No se peuden modificar boletas que han sido agrupadas!');

      ticket.bill = false;
      ticket.totalPrice -= ticket.tax;
      ticket.tax = 0;
      ticket.usersInvolved.modifiedSeries = userRequesting.id;

      const folio = await Folio.findOneAndUpdate(
        { name: ticket.bill ? 'A' : 'B' },
        { $inc: { count: 1 } },
        { new: false }
      ).select('name count');

      const oldFolio = ticket.folio;
      ticket.folio = folio.name.toString() + folio.count.toString();

      await ticket.save();
      await Turn.findByIdAndUpdate(
        ticket.turn,
        {
          $set: { 'folios.$[folio]': ticket.folio } // Remove old folio
        },
        { arrayFilters: [{ folio: oldFolio }] }
      );

      return Ticket.findById(id).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
    } catch (e) {
      return e;
    }
  }),
  ticketUpdatePrice: authenticated(async (_, { id, price }, { req: { userRequesting } }) => {
    try {
      const ticket = await Ticket.findById(id).populate([
        {
          path: 'client truck product turn promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      if (!ticket) return new Error('No ha sido posible encontrar la boleta!');

      ticket.totalPrice = price;
      ticket.tax = ticket.bill ? price - price / (1 + TAX) : 0;
      ticket.usersInvolved.modifiedPrice = userRequesting.id;

      await ticket.save();

      return ticket;
    } catch (e) {
      return e;
    }
  }),
  ticketExcludeFromTimeMetrics: async (_, { tickets, exclude }) => {
    await Ticket.updateMany(
      { _id: { $in: tickets } },
      { $set: { excludeFromTimeMetrics: exclude } }
    );

    return true;
  }
};

export default ticketMutations;
