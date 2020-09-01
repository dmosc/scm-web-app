const lapSubscriptions = {
  lapUpdate: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('LAP_UPDATE')
  },
  activeLaps: {
    subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ACTIVE_LAPS')
  }
};

export default lapSubscriptions;
