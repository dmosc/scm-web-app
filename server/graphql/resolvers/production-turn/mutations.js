import authenticated from '../../middleware/authenticated';
import { ProductionTurn } from '../../../mongo-db/models';

const productionTurnMutations = {
  productionTurnInit: authenticated(async (_, __, { pubsub }) => {
    const [existentProductionTurn, [lastProductionTurn]] = await Promise.all([
      ProductionTurn.findOne({ end: { $exists: false } }),
      ProductionTurn.find({})
        .sort({ folio: -1 })
        .limit(1)
    ]);

    if (existentProductionTurn) return new Error('¡Ya hay un turno de producción activo!');

    const productionTurn = new ProductionTurn({});

    productionTurn.folio = (parseInt(lastProductionTurn?.folio, 10) || 100000) + 1;
    productionTurn.start = new Date();

    try {
      await productionTurn.save();

      pubsub.publish('PRODUCTION_TURN_UPDATE', { productionTurnUpdate: productionTurn });

      return ProductionTurn.findById(productionTurn.id).populate('laps');
    } catch (e) {
      return e;
    }
  }),
  productionTurnEnd: authenticated(async (_, args, { pubsub }) => {
    const { id } = args.productionTurn;

    const productionTurn = await ProductionTurn.findOneAndUpdate(
      { _id: id },
      { end: new Date() },
      { new: true }
    ).populate('laps');

    pubsub.publish('PRODUCTION_TURN_UPDATE', { productionTurnUpdate: productionTurn });

    return productionTurn;
  })
};

export default productionTurnMutations;
