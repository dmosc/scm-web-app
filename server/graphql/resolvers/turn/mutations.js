import { Ticket, Turn } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const turnMutations = {
  turnInit: authenticated(async (_, args, { pubsub }) => {
    const [existentTurn, [{ uniqueId }]] = await Promise.all([
      Turn.findOne({ end: { $exists: false } }),
      Turn.find({})
        .sort({ uniqueId: -1 })
        .limit(1)
    ]);

    if (existentTurn) return new Error('¡Ya hay un turno activo!');

    const turn = new Turn({ ...args.turn });
    turn.uniqueId = (uniqueId || 1000) + 1;

    turn.start = new Date();

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

      const turn = await Turn.findOneAndUpdate(
        { _id: id },
        { end: new Date() },
        { new: true }
      ).populate('user');

      // Save who ends turn
      turn.user = userRequesting.id;

      await turn.save();

      if (!turn) return new Error('¡No ha sido posible encontrar el turno!');

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
        deleted: false,
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
