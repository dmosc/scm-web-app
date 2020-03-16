import { RockPriceRequest, Rock } from '../../../mongo-db/models';

const rockPriceRequestMutations = {
  rockPriceRequest: async (_, args, { req: { userRequesting } }) => {
    if (args.rockPriceRequest.priceRequested < args.rockPriceRequest.floorPriceRequested)
      throw new Error(
        'General price requested should be greater or equal than floor price requested'
      );

    const priceRequest = new RockPriceRequest({
      ...args.rockPriceRequest,
      requester: userRequesting.id
    });

    await priceRequest.save();

    return RockPriceRequest.findOne({ _id: priceRequest.id });
  },
  rockPriceRequestEdit: async (_, args, { req: { userRequesting } }) => {
    const priceRequest = await RockPriceRequest.findOne({ _id: args.rockPriceRequest.id });

    // Only PENDING requests can change status
    // Once it was ACCEPTED or REJECTED, its lifecycle ends
    if (priceRequest.status !== 'PENDING')
      throw new Error(
        `This price request was previously ${priceRequest.status}. It can't be edited`
      );

    // ACCOUNTANT can only edit their own requests, and ADMIN can edit any request.
    if (userRequesting.role !== 'ADMIN' && userRequesting.id !== priceRequest.requester)
      throw new Error('You can only edit your own created price requests');

    const newPriceRequest = {
      priceRequested: priceRequest.priceRequested,
      floorPriceRequested: priceRequest.floorPriceRequested,
      ...args.rockPriceRequest
    };

    // It's needed to validate if the price requested is greater
    // than the floorPrice requested to avoid inconsistencies
    if (newPriceRequest.priceRequested < newPriceRequest.floorPriceRequested)
      throw new Error('Price requested should be greater or equal than the requested floor price');

    // Having an edit status means that it will be ACCEPTED or REJECTED
    if (newPriceRequest.status) {
      // Only ADMIN can edit status field
      if (userRequesting.role !== 'ADMIN') throw new Error('Only admins can update the status');

      // If status is edited, save who has changed the status and apply changes
      newPriceRequest.reviewedBy = userRequesting.id;
      newPriceRequest.reviewedAt = Date.now();

      // Only apply prices to rock if accepted
      if (newPriceRequest.status === 'ACCEPTED') {
        const rockToUpdate = await Rock.findOne({ _id: priceRequest.rock });

        rockToUpdate.price = priceRequest.priceRequested;

        rockToUpdate.floorPrice = priceRequest.floorPriceRequested;

        await rockToUpdate.save();
      }
    }

    Object.keys(newPriceRequest).forEach(field => {
      priceRequest[field] = newPriceRequest[field];
    });

    // MUST USE .save() OPERATION TO RUN
    // MODEL VALIDATIONS CORRECTLY. PLEASE AVOID
    // findOneAndUpdate or similars
    return priceRequest.save();
  }
};

export default rockPriceRequestMutations;
