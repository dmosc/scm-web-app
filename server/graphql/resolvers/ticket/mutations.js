import { ApolloError } from 'apollo-client';
import Transaction from 'mongoose-transactions';
import { Client, Folio, Rock, Ticket, Truck } from '../../../mongo-db/models';
import uploaders from '../aws/uploaders';
import authenticated from '../../middleware/authenticated';

const TAX = 0.16;

const ticketMutations = {
  ticket: authenticated(async (_, args) => {
    const ticket = new Ticket({ ...args.ticket }).populate('client truck product');

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
      ).populate('client truck product');
      const activeTickets = await Ticket.find({ turn: { $exists: false } }).populate(
        'client truck product'
      );
      const loadedTickets = await Ticket.find({
        turn: { $exists: false },
        load: { $exists: true }
      }).populate('client truck product');

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
    const { plates, product: productId, inTruckImage: image, folderKey, id } = args.ticket;
    const newTicket = new Ticket({ ...args.ticket });

    const ticketExists = await Ticket.aggregate([
      { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
      { $match: { 'truck.plates': plates, turn: { $exists: false } } }
    ]);

    if (ticketExists.length !== 0) throw new Error(`¡El camión ${plates} ya está activo!`);

    try {
      const truck = await Truck.findOne({ plates });
      const product = await Rock.findById(productId);
      const client = await Client.findById(truck.client);

      newTicket.client = client.id;
      newTicket.truck = truck.id;
      newTicket.product = product.id;
      newTicket.usersInvolved.guard = userRequesting.id;

      transaction.insert('Ticket', newTicket);
      await transaction.run();

      newTicket.inTruckImage = await uploaders.imageUpload(_, { image, folderKey, id });

      await newTicket.save();

      const ticket = await Ticket.findById(newTicket.id).populate('client truck product');
      const activeTickets = await Ticket.find({ turn: { $exists: false } }).populate(
        'client truck product'
      );
      const notLoadedActiveTickets = await Ticket.find({
        turn: { $exists: false },
        load: { $exists: false }
      }).populate('client truck product');

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
    const { id, outTruckImage } = args.ticket;

    try {
      const newTicket = await Ticket.findOneAndUpdate(
        { _id: id },
        { outTruckImage },
        { new: true }
      );

      const ticket = await Ticket.findById(newTicket.id).populate('client truck product');

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
      ).populate('client truck product');

      const loadedTickets = await Ticket.find({
        turn: { $exists: false },
        load: { $exists: true }
      }).populate('client truck product');

      const notLoadedActiveTickets = await Ticket.find({
        turn: { $exists: false },
        load: { $exists: false }
      }).populate('client truck product');

      pubsub.publish('TICKET_UPDATE', { ticketUpdate: newTicket });
      pubsub.publish('LOADED_TICKETS', { loadedTickets });
      pubsub.publish('NOT_LOADED_ACTIVE_TICKETS', { notLoadedActiveTickets });

      return newTicket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketSubmit: authenticated(async (_, args, { pubsub }) => {
    const { id, driver, weight, credit, bill } = args.ticket;

    const newTicket = await Ticket.findOneAndUpdate(
      { _id: id },
      { driver: driver.toUpperCase(), weight: weight.toFixed(2), bill },
      { new: true }
    ).populate('client truck');

    if (!newTicket) throw new Error('¡No ha sido posible encontrar el ticket!');

    const client = await Client.findById(newTicket.client).populate('prices.rock');
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

    const specialPrice = client.prices.find(({ rock }) => rock.name === product.name);
    const price = specialPrice ? specialPrice : product.price;

    newTicket.tax = newTicket.bill ? newTicket.totalWeight * price * TAX : 0;
    newTicket.totalPrice = (newTicket.totalWeight * price + newTicket.tax).toFixed(2);

    if ((newTicket.credit && credit) || (newTicket.credit && !credit))
      // Return previous credit to client
      client.credit = (client.credit + newTicket.totalPrice).toFixed(2);

    newTicket.credit = credit;

    try {
      if (credit) {
        if (client.credit < newTicket.totalPrice)
          return new Error('¡El cliente no tiene suficientes créditos!');
        client.credit = (client.credit - newTicket.totalPrice).toFixed(2);
      }

      await newTicket.save();
      await client.save();

      const ticket = await Ticket.findById(newTicket.id).populate('client truck product');

      pubsub.publish('TICKET_UPDATE', { ticketUpdate: ticket });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  })
};

export default ticketMutations;
