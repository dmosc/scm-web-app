/* eslint-disable new-cap */
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import aesjs from 'aes-js';
import { Truck } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import { AES_SECRET } from '../../../config';

const truckQueries = {
  truck: authenticated(async (_, args) => {
    const { id, plates } = args;
    const truck = await Truck.findOne({
      deleted: false,
      $or: [{ _id: id }, { plates }]
    }).populate('client');

    if (!truck) throw new Error('¡El camión no existe!');

    return truck;
  }),
  trucks: authenticated(async (_, { filters: { limit, search } }) => {
    const trucks = await Truck.find({
      deleted: false,
      $or: [
        { plates: { $in: [new RegExp(search, 'i')] } },
        { brand: { $in: [new RegExp(search, 'i')] } },
        { model: { $in: [new RegExp(search, 'i')] } },
        { drivers: { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .limit(limit || Number.MAX_SAFE_INTEGER)
      .populate('client');

    if (!trucks) throw new Error('¡No ha sido posible cargar los camiones!');

    return trucks;
  }),
  truckQRCode: authenticated(async (_, { id }) => {
    const { plates } = await Truck.findOne({ _id: id });

    const bufferedKey = Buffer.from(AES_SECRET);
    const platesBytes = aesjs.utils.utf8.toBytes(plates);

    const aesCtr = new aesjs.ModeOfOperation.ctr(bufferedKey);

    const encryptedBytes = aesCtr.encrypt(platesBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    // The \u0019 is an F12
    // Frontend relies on this key to active the hidden input
    // with the ciphered plates
    return QRCode.toDataURL(`\u0019\u0019\u0019\u0019${encryptedHex}`, {
      width: 1200,
      version: 4
    });
  }),
  truckDecipherPlates: authenticated(async (_, { cipheredPlates }) => {
    const bufferedKey = Buffer.from(AES_SECRET);
    const aesCtr = new aesjs.ModeOfOperation.ctr(bufferedKey);

    const encryptedBytes = aesjs.utils.hex.toBytes(cipheredPlates);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  })
};

export default truckQueries;
