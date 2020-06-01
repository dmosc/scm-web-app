/* eslint-disable new-cap */
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import aesjs from 'aes-js';
import { Truck } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import { AES_SECRET } from '../../../config';

const truckQueries = {
  truck: authenticated(async (_, args) => {
    const { id, plates, client } = args;

    let query = { deleted: false };

    if (id) query = { ...query, _id: id };
    else query = { ...query, plates, client };

    const truck = await Truck.findOne(query).populate('client');

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
  similarTrucks: authenticated(async (_, { plates }) => {
    const trucks = await Truck.find({ deleted: false, plates: plates.toUpperCase() }).populate(
      'client'
    );

    if (!trucks) throw new Error('¡No ha sido posible cargar los camiones!');

    return trucks;
  }),
  trucksXLS: authenticated(async (_, { filters: { limit, search } }) => {
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

    const attributes = [
      {
        header: 'Placas',
        key: 'plates'
      },
      {
        header: 'Marca',
        key: 'brand'
      },
      {
        header: 'Modelo',
        key: 'model'
      },
      {
        header: 'Negocio',
        key: 'businessName'
      },
      {
        header: 'Peso (tons)',
        key: 'weight'
      },
      {
        header: 'Conductores',
        key: 'drivers'
      }
    ];

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'GEMSA';
    workbook.lastModifiedBy = 'GEMSA';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet('Camiones');
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    worksheet.columns = attributes;
    worksheet.columns.forEach(column => {
      // eslint-disable-next-line no-param-reassign
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });

    trucks.forEach(truck => {
      const row = {};
      attributes.forEach(({ key }) => {
        row[key] = truck[key];
      });

      row.businessName = truck.client.businessName;
      row.drivers = row.drivers.join(', ');

      worksheet.addRow(row);
    });

    const firstRow = worksheet.getRow(1);
    firstRow.font = {
      size: 12,
      bold: true
    };
    firstRow.alignment = { vertical: 'middle' };
    firstRow.height = 20;

    const buffer = await workbook.xlsx.writeBuffer();
    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
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
