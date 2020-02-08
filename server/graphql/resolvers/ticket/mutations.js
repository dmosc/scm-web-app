import { ApolloError } from 'apollo-client';
import { Ticket, Client, Truck, Rock, Folio } from '../../../mongo-db/models';
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
  ticketInit: authenticated(async (_, args, { pubsub }) => {
    const newTicket = new Ticket({ ...args.ticket });

    const { plates, product: productId } = args.ticket;

    const truck = await Truck.findOne({ plates });

    if (!truck) throw new Error('¡El camión no está registrado!');

    const product = await Rock.findById(productId);
    const client = await Client.findById(truck.client);

    newTicket.client = client.id;
    newTicket.truck = truck.id;
    newTicket.product = product.id;

    try {
      await newTicket.save();
      await truck.save();

      const ticket = await Ticket.findById(newTicket.id).populate('client truck product');
      const activeTickets = await Ticket.find({ turn: { $exists: false } }).populate(
        'client truck product'
      );

      pubsub.publish('ACTIVE_TICKETS', { activeTickets });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
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
  ticketSubmit: authenticated(async (_, args, { pubsub }) => {
    const { id, driver, weight, credit, bill } = args.ticket;

    const newTicket = await Ticket.findOneAndUpdate(
      { _id: id },
      { driver: driver.toUpperCase(), weight: weight.toFixed(2), bill },
      { new: true }
    ).populate('client truck');

    if (!newTicket) throw new Error('¡No ha sido posible encontrar el ticket!');

    const client = await Client.findById(newTicket.client);
    const product = await Rock.findById(newTicket.product);
    const truck = await Truck.findById(newTicket.truck);

    const folio = await Folio.findOneAndUpdate(
      { name: newTicket.bill ? 'A' : 'B' },
      { $inc: { count: 1 } },
      { new: false }
    ).select('name count');

    newTicket.folio = folio.name.toString() + folio.count.toString();

    if (truck.drivers.every(driver => driver.toUpperCase() !== newTicket.driver))
      truck.drivers.push(newTicket.driver);

    newTicket.totalWeight = (newTicket.weight - newTicket.truck.weight).toFixed(2);

    const price = client.prices[product.name] ? client.prices[product.name] : product.price;

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
      await truck.save();

      const ticket = await Ticket.findById(newTicket.id).populate('client truck product');

      pubsub.publish('TICKET_UPDATE', { ticketUpdate: ticket });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  })
};

export default ticketMutations;
