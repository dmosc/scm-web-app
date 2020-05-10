import { Promotion } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const promotionMutations = {
  promotion: authenticated(async (_, args, { req: { userRequesting } }) => {
    const promotion = new Promotion({ ...args.promotion });

    promotion.name = promotion.name.toUpperCase();
    promotion.createdBy = userRequesting.id;

    if (promotion.limit) promotion.currentLimit = 0;

    try {
      await promotion.save();
      return Promotion.findById(promotion.id).populate('product.rock clients groups createdBy');
    } catch (e) {
      return e;
    }
  }),
  promotionEdit: authenticated(async (_, args) => {
    const { promotion } = args;
    const promotionToSet = await Promotion.findOne({ _id: args.promotion.id });

    promotionToSet.name = promotion.name.toUpperCase();
    promotionToSet.limit = promotion.limit ? promotion.limit : undefined;
    promotionToSet.currentLimit = !promotion.limit
      ? undefined
      : promotionToSet.currentLimit
      ? promotionToSet.currentLimit
      : 0;
    promotionToSet.start = promotion.start ? promotion.start : undefined;
    promotionToSet.end = promotion.end ? promotion.end : undefined;
    promotionToSet.bill = typeof promotion.bill !== 'undefined' ? promotion.bill : undefined;
    promotionToSet.credit = typeof promotion.credit !== 'undefined' ? promotion.credit : undefined;
    promotionToSet.clients = promotion.clients ? [...promotion.clients] : undefined;
    promotionToSet.groups = promotion.groups ? [...promotion.groups] : undefined;

    await promotionToSet.save();

    return Promotion.findById(promotion.id).populate('product.rock clients groups createdBy');
  }),
  promotionDisable: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Promotion.disableById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  }),
  promotionEnable: authenticated(async (_, { id }) => {
    try {
      await Promotion.enable({ _id: id });
      return true;
    } catch (e) {
      return e;
    }
  }),
  promotionDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Promotion.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default promotionMutations;
