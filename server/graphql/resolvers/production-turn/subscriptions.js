const productionTurnSubscriptions = {
  productionTurnUpdate: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('PRODUCTION_TURN_UPDATE')
  }
};

export default productionTurnSubscriptions;