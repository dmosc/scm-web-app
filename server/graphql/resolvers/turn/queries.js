import {Ticket, Turn} from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const turnQueries = {
    turn: authenticated(async (_, args) => {
        const {id} = args;
        const turn = await Turn.findOne({_id: id}).populate('user');

        if (!turn) throw new Error('Turn does not exists!');

        return turn;
    }),
    turns: authenticated(async (_, {filters: {limit}}) => {
        const turns = await Turn.find({})
            .limit(limit || 50)
            .populate('user');

        if (!turns) throw new Error("Couldn't find any turns available!");

        return turns;
    }),
    turnActive: authenticated(() => {
        return Turn.findOne({end: {$exists: false}});
    }),
    turnSummary: authenticated(async () => {
        const turn = await Turn.findOne({end: {$exists: false}});
        const clients = await Ticket
            .aggregate([
                {$match: {turn: turn._id, totalPrice: {$exists: true}, outTruckImage: {$exists: true}}},
                {$lookup: {from: 'users', localField: 'client', foreignField: '_id', as: 'client'}},
                {$lookup: {from: 'rocks', localField: 'product', foreignField: '_id', as: 'product'}},
                {$lookup: {from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck'}},
                {$group: {_id: "$client", count: {$sum: 1}, tickets: {$push: {
                    id: "$_id",
                    folio: "$folio",
                    driver: "$driver",
                    truck: "$truck",
                    product: "$product",
                    tax: "$tax",
                    weight: "$weight",
                    totalWeight: "$totalWeight",
                    totalPrice: "$totalPrice",
                    credit: "$credit",
                    inTruckImage: "$inTruckImage",
                    outTruckImage: "$outTruckImage"
                }}}},
                {$project: {_id: 0, info: "$_id", count: "$count", tickets: "$tickets"}}
            ]);

        if(clients.length === 0) return {clients, upfront: 0, credit: 0, total: 0};

        let upfront = 0, credit = 0, total = 0;
        for(let client of clients) {
            const {tickets} = client;
            for(let ticket of tickets) {
                if(ticket.credit) credit += ticket.totalPrice;
                else upfront += ticket.totalPrice;

                total += ticket.totalPrice;
            }
        }

        for(let i = 0; i < clients.length; i++) { // Parse data and remove generated arrays from $lookups
            clients[i].info = {...clients[i].info[0]};
            clients[i].info.id = clients[i].info._id;
            delete clients[i].info._id;

            const {tickets} = clients[i];
            for(let ticket of tickets) {
                ticket.product = {...ticket.product[0]};
                ticket.truck = {...ticket.truck[0]};

                ticket.product.id = ticket.product._id;
                ticket.truck.id = ticket.truck._id;

                delete ticket.product._id;
                delete ticket.truck._id;
            }
        }

        return {clients, upfront, credit, total};
    })
};

export default turnQueries;
