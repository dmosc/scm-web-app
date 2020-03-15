import { RockPriceRequest, Rock } from '../../../mongo-db/models';

const rockPriceRequestMutations = {
  rockPriceRequest: async (_, args, { req: { userRequesting } }) => {
    const priceRequest = new RockPriceRequest({
      ...args.priceRequest,
      requester: userRequesting.id
    });

    await priceRequest.save();

    return RockPriceRequest.findOne({ _id: priceRequest.id });
  },
  rockPriceRequestEdit: async (_, args, { req: { userRequesting } }) => {
    const priceRequest = await RockPriceRequest.findOne({ _id: args.priceRequest.id }).populate(
      'rock'
    );

    // Only PENDING requests can change status
    // Once it was ACCEPTED or REJECTED, its lifecycle ends
    if (priceRequest.status !== 'PENDING')
      throw new Error(
        `This price request was previously ${priceRequest.status}. It can't be edited`
      );

    // Not admins can only edit their own requests, and ADMIN can edit any request.
    if (userRequesting.role !== 'ADMIN' && userRequesting.id !== priceRequest.requester)
      throw new Error('You can only edit your own created price requests');

    const newPriceRequest = { ...args.priceRequest };

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
