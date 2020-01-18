import {Ticket, Turn} from '../../../mongo-db/models';
import {Ticket as NewTicket} from '../../../sequelize-db/models';
import authenticated from '../../middleware/authenticated';

const turnMutations = {
    turnInit: authenticated(async (_, args, {pubsub}) => {
        const existentTurn = await Turn.findOne({end: {$exists: false}});

        if(existentTurn) return new Error("¡Ya hay un turno activo!");

        const turn = new Turn({...args.turn});
        const start = new Date();
        const offset = start.getTimezoneOffset() / 60;

        turn.start = start.setHours(start.getHours() - offset);

        const tickets = await Ticket.find({turn: {$exists: false}});
        turn.folios = tickets.map(({folio}) => folio);

        await Ticket.updateMany({turn: {$exists: false}}, {turn: turn._id});

        try {
            await turn.save();

            pubsub.publish('TURN_UPDATE', {
                turnUpdate: turn,
            });

            return await Turn.findById(turn.id).populate('user');
        } catch(e) {
            return e;
        }
    }),
    turnEnd: authenticated(async (_, args, {pubsub}) => {
        try {
            const {turn: {id}} = args;
            const end = new Date();
            const offset = end.getTimezoneOffset() / 60;

            const turn = await Turn.findOneAndUpdate({_id: id}, {end: end.setHours(end.getHours() - offset)}, {new: true}).populate('user');

            if(!turn) return new Error("¡No ha sido posible encontrar el turno!");

            const tickets = await Ticket.find({folio: {$in: [...turn.folios]}}).populate('client truck product');

            for(let i = 0; i < tickets.length; i++) {
                const {client: {prices}, product: {name: product, price}} = tickets[i];
                const ticket = await NewTicket.create({
                    folio: tickets[i].folio,
                    driver: tickets[i].driver,
                    client: `${tickets[i].client.firstName} ${tickets[i].client.lastName}`,
                    businessName: tickets[i].client.businessName,
                    address: tickets[i].client.address,
                    rfc: tickets[i].client.rfc,
                    plates: tickets[i].truck.plates,
                    truckWeight: tickets[i].truck.weight,
                    totalWeight: tickets[i].weight,
                    tons: tickets[i].totalWeight,
                    product: tickets[i].product.name,
                    price: prices[product] ? prices[product] : price,
                    tax: tickets[i].tax,
                    total: tickets[i].totalPrice,
                    inTruckImage: tickets[i].inTruckImage,
                    outTruckImage: tickets[i].outTruckImage
                });

                if(!ticket) return new Error('¡Ha habido un error durante la migración de los tickets!');

                const oldTicket = await Ticket.findByIdAndDelete(tickets[i].id);

                if(!oldTicket) await ticket.destroy();
            }

            pubsub.publish('TURN_UPDATE', {
                turnUpdate: turn,
            });

            return turn;
        } catch(e) {
            return e;
        }
    }),
};

export default turnMutations;
