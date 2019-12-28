import {Ticket, Client, Truck, Rock, Folio} from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import {ApolloError} from 'apollo-client';

const TAX = 0.16;

const ticketMutations = {
  ticket: authenticated(async (_, args) => {
    const ticket = new Ticket({...args.ticket}).populate(
      'client truck product'
    );

    try {
      await ticket.save();

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketInit: authenticated(async (_, args, {pubsub}) => {
    const newTicket = new Ticket({...args.ticket});

    const {plates, product: productId} = args.ticket;

    const truck = await Truck.findOne({plates});

    if (!truck) throw new Error('Truck is not registered!');

    const client = await Client.findById(truck.client);
    const product = await Rock.findById(productId);
    const folio = await Folio.findOneAndUpdate(
      {name: client.bill ? 'A' : 'B'},
      {$inc: {count: 1}},
      {new: false}
    ).select('name count');

    newTicket.folio = folio.name.toString() + folio.count.toString();
    newTicket.client = client.id;
    newTicket.truck = truck.id;
    newTicket.product = product.id;

    try {
      await newTicket.save();
      await truck.save();

      const ticket = await Ticket.findById(newTicket.id).populate(
        'client truck product'
      );

      pubsub.publish('NEW_TICKET', {
        newTicket: ticket,
      });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketProductLoad: authenticated(async (_, args, {pubsub}) => {
    const {id, outTruckImage} = args.ticket;

    try {
      const newTicket = await Ticket.findOneAndUpdate(
        {_id: id},
        {outTruckImage},
        {new: true}
      );

      const ticket = await Ticket.findById(newTicket.id).populate(
        'client truck product'
      );

      pubsub.publish('TICKET_UPDATE', {
        ticketUpdate: ticket,
      });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketSubmit: authenticated(async (_, args, {pubsub}) => {
    const {id, driver, weight, credit} = args.ticket;

    const newTicket = await Ticket.findOneAndUpdate(
      {_id: id},
      {driver: driver.toUpperCase(), weight: weight.toFixed(2)},
      {new: true}
    ).populate('client truck');

    if (!newTicket) throw new Error('Ticket not found!');

    const client = await Client.findById(newTicket.client);
    const product = await Rock.findById(newTicket.product);
    const truck = await Truck.findById(newTicket.truck);

    if (
      truck.drivers.every(driver => driver.toUpperCase() !== newTicket.driver)
    )
      truck.drivers.push(newTicket.driver);

    newTicket.totalWeight = (newTicket.weight - newTicket.truck.weight).toFixed(
      2
    );

    const price = client.prices[product.name]
      ? client.prices[product.name]
      : product.price;

    newTicket.tax = client.bill ? newTicket.totalWeight * price * TAX : 0;

    // Return client's prev credit if ticket is being updated
    if (newTicket.totalPrice)
      client.credit = (client.credit + newTicket.totalPrice).toFixed(2);

    newTicket.totalPrice = (
      newTicket.totalWeight * price +
      newTicket.tax
    ).toFixed(2);

    try {
      if (!credit) {
        newTicket.credit = credit;
      } else if (client.credit < newTicket.totalPrice) {
        throw new Error("Client doesn't have sufficient credit!");
      } else {
        newTicket.credit = credit;
        client.credit = (client.credit - newTicket.totalPrice).toFixed(2);
      }

      await newTicket.save();
      await client.save();
      await truck.save();

      const ticket = await Ticket.findById(newTicket.id).populate(
        'client truck product'
      );

      pubsub.publish('TICKET_UPDATE', {
        ticketUpdate: ticket,
      });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
};

export default ticketMutations;
