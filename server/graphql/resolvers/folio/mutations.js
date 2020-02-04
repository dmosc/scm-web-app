import { Folio } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';

const folioMutations = {
  folio: authenticated(async (_, args) => {
    const folio = new Folio({ ...args.folio });
    folio.name = folio.name.toUpperCase();

    try {
      await folio.save();
      return folio;
    } catch (e) {
      return e;
    }
  })
};

export default folioMutations;
