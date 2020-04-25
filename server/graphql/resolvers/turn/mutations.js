import { ClientPrice, Ticket, Turn } from '../../../mongo-db/models';
import { Ticket as NewTicket } from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const turnMutations = {
  turnInit: authenticated(async (_, args, { pubsub }) => {
    const existentTurn = await Turn.findOne({ end: { $exists: false } });

    if (existentTurn) return new Error('¡Ya hay un turno activo!');

    const turn = new Turn({ ...args.turn });
    const start = new Date();
    const offset = start.getTimezoneOffset() / 60;

    turn.start = start.setHours(start.getHours() - offset);

    try {
      await turn.save();

      pubsub.publish('TURN_UPDATE', { turnUpdate: turn });

      return await Turn.findById(turn.id).populate('user');
    } catch (e) {
      return e;
    }
  }),
  turnEnd: authenticated(async (_, args, { pubsub, req: { userRequesting } }) => {
    try {
      const {
        turn: { id }
      } = args;
      const end = new Date();
      const offset = end.getTimezoneOffset() / 60;

      const turn = await Turn.findOneAndUpdate(
        { _id: id },
        { end: end.setHours(end.getHours() - offset) },
        { new: true }
      ).populate('user');

      if (!turn) return new Error('¡No ha sido posible encontrar el turno!');

      const tickets = await Ticket.find({ folio: { $in: [...turn.folios] } }).populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);

      const ticketsToCreate = [];
      const ticketsToDelete = [];
      const ticketsToDestroy = [];

      for (let i = 0; i < tickets.length; i++) {
        const { product } = tickets[i];

        let price;
        // eslint-disable-next-line no-await-in-loop
        const specialPrice = await ClientPrice.find({
          client: tickets[i].client,
          rock: tickets[i].product
        }).sort({
          addedAt: 'descending'
        });

        if (!specialPrice[0] || specialPrice[0].noSpecialPrice) price = product.price;
        else price = specialPrice[0].price;

        const ticket = NewTicket.create({
          folio: tickets[i].folio,
          driver: tickets[i].driver,
          client: `${tickets[i].client.firstName} ${tickets[i].client.lastName}`,
          businessName: tickets[i].client.businessName,
          address: Object.values(tickets[i].client.address)
            .filter(value => typeof value === 'string')
            .map(value => value.toUpperCase().trim())
            .join(', '),
          rfc: tickets[i].client.rfc,
          plates: tickets[i].truck.plates,
          truckWeight: tickets[i].truck.weight,
          totalWeight: tickets[i].weight,
          tons: tickets[i].totalWeight,
          product: product.name,
          price,
          tax: tickets[i].tax,
          total: tickets[i].totalPrice,
          inTruckImage: tickets[i].inTruckImage,
          outTruckImage: tickets[i].outTruckImage
        });

        ticketsToCreate.push(ticket);

        if (!ticket) return new Error('¡Ha habido un error durante la migración de los tickets!');

        const oldTicket = Ticket.deleteById(tickets[i].id, userRequesting.id);

        ticketsToDelete.push(oldTicket);
      }

      const [ticketsCreated, ticketsDeleted] = await Promise.all([
        Promise.all(ticketsToCreate),
        Promise.all(ticketsToDelete)
      ]);

      for (let i = 0; i < ticketsDeleted.length; i++)
        if (!ticketsDeleted[i]) ticketsToDestroy.push(ticketsCreated[i].destroy());

      await Promise.all(ticketsToDestroy);

      pubsub.publish('TURN_UPDATE', { turnUpdate: turn });

      return turn;
    } catch (e) {
      return e;
    }
  }),
  turnAddTicket: authenticated(async (_, args, { req: { userRequesting }, pubsub }) => {
    const ticket = await Ticket.findById(args.turn.ticket);

    if (!ticket) throw new Error('!No ha sido posible encontrar el ticket!');

    const turn = await Turn.findOne({ end: { $exists: false } });

    for (let i = 0; i < turn.folios.length; i++)
      if (turn.folios[i] === ticket.folio) throw new Error('¡Este folio ya fue agregado al turno!');

    if (!turn) throw new Error('!No hay ningún turno activo!');

    turn.folios.push(ticket.folio);
    ticket.turn = turn.id;
    ticket.out = Date.now();
    ticket.usersInvolved.cashier = userRequesting.id;

    try {
      await ticket.save();
      await turn.save();

      const activeTickets = await Ticket.find({
        disabled: false,
        turn: { $exists: false }
      }).populate([
        {
          path: 'client truck product turn store promotion',
          populate: {
            path: 'stores',
            model: 'Store'
          }
        }
      ]);
      const loadedTickets = await Ticket.find({
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

      pubsub.publish('ACTIVE_TICKETS', { activeTickets });
      pubsub.publish('LOADED_TICKETS', { loadedTickets });
      pubsub.publish('TURN_UPDATE', { turnUpdate: turn });

      return turn;
    } catch (e) {
      return e;
    }
  })
};

export default turnMutations;
