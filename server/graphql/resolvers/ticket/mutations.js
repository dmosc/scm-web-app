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
    const newTicket = new Ticket({...args});

    const {plates, product: productId} = args;

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
    const {outTruckImage} = args;

    const ticket = await Ticket.findOneAndUpdate(
      {_id: args.ticket},
      {outTruckImage},
      {new: true}
    );

    if (!ticket) throw new Error('Ticket not found!');

    try {
      await ticket.save();

      pubsub.publish('TICKET_UPDATE', {
        ticketUpdate: ticket,
      });

      return ticket;
    } catch (e) {
      return new ApolloError(e);
    }
  }),
  ticketSubmit: authenticated(async (_, args, {pubsub}) => {
    const {driver, weight} = args;

    const newTicket = await Ticket.findOneAndUpdate(
      {_id: args.ticket},
      {driver: driver.toUpperCase(), weight: weight.toFixed(2)},
      {new: true}
    ).populate('client truck');

    const client = await Client.findById(newTicket.client);
    const product = await Rock.findById(newTicket.product);
    const truck = await Truck.findById(newTicket.truck);

    if (!newTicket) throw new Error('Ticket not found!');

    if (
      truck.drivers.every(driver => driver.toUpperCase() !== newTicket.driver)
    )
      truck.drivers.push(newTicket.driver);

    newTicket.totalWeight = (newTicket.weight - newTicket.truck.weight).toFixed(
      2
    );
    newTicket.tax = client.bill
      ? newTicket.totalWeight * product.price * TAX
      : 0;

    newTicket.totalPrice = (
      newTicket.totalWeight * product.price +
      newTicket.tax
    ).toFixed(2);

    try {
      await newTicket.save();
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
