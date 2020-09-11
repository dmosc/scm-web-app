/* eslint-disable no-param-reassign */
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { Rock, Ticket } from '../../../../mongo-db/models';
import authenticated from '../../../middleware/authenticated';
import { format, list } from '../../../../../src/utils/functions';
import {
  columnToLetter,
  createWorkbook,
  createWorksheet,
  headerRows,
  solidFill
} from '../../../../utils/reports';

const ticketReports = {
  ticketsSummaryByClientXLS: authenticated(
    async (
      _,
      {
        range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
        turnId,
        billType,
        paymentType
      }
    ) => {
      const $match = {
        deleted: false,
        disabled: false,
        out: { $gte: new Date(range.start), $lte: new Date(range.end) },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true }
      };

      if (turnId) {
        $match.turn = Types.ObjectId(turnId);
      }

      if (billType) {
        if (billType === 'BILL') $match.tax = { $gt: 0 };
        if (billType === 'REMISSION') $match.tax = { $eq: 0 };
      }

      if (paymentType) {
        if (paymentType === 'CASH') $match.credit = false;
        if (paymentType === 'CREDIT') $match.credit = true;
      }

      const clients = await Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' } },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        { $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' } },
        {
          $group: {
            _id: '$client',
            tickets: {
              $push: {
                folio: '$folio',
                truck: '$truck',
                out: {
                  $dateToString: {
                    date: '$out',
                    format: '%Y-%m-%d %H:%M:%S',
                    timezone: 'America/Monterrey'
                  }
                },
                product: '$product',
                totalWeight: '$totalWeight',
                tax: '$tax',
                subtotal: { $subtract: ['$totalPrice', '$tax'] },
                totalPrice: '$totalPrice',
                credit: '$credit',
                bill: '$bill'
              }
            },
            totalWeight: { $sum: '$totalWeight' },
            subtotal: { $sum: { $subtract: ['$totalPrice', '$tax'] } },
            tax: { $sum: '$tax' },
            totalPrice: { $sum: '$totalPrice' }
          }
        },
        {
          $project: {
            _id: 0,
            client: '$_id',
            tickets: '$tickets',
            totalWeight: '$totalWeight',
            subtotal: '$subtotal',
            tax: '$tax',
            totalPrice: '$totalPrice'
          }
        }
      ]);

      const attributes = [
        {
          header: 'RFC',
          key: 'rfc'
        },
        {
          header: 'Cliente',
          key: 'businessName'
        },
        {
          header: 'Folio',
          key: 'folio'
        },
        {
          header: 'Fecha',
          key: 'out'
        },
        {
          header: 'Placas',
          key: 'plates'
        },
        {
          header: 'Producto',
          key: 'product'
        },
        {
          header: 'Peso neto',
          key: 'totalWeight'
        },
        {
          header: 'Subtotal',
          key: 'subtotal'
        },
        {
          header: 'Impuesto',
          key: 'tax'
        },
        {
          header: 'Total',
          key: 'totalPrice'
        },
        {
          header: 'Tipo de pago',
          key: 'credit'
        },
        {
          header: 'Tipo de boleta',
          key: 'bill'
        }
      ];

      for (let i = 0; i < attributes.length; i++) attributes[i] = { ...attributes[i], width: 15 };

      const workbook = createWorkbook();

      const worksheet = createWorksheet(
        workbook,
        {
          name: 'Boletas',
          columns: attributes,
          date: new Date(),
          title: `Boletas filtradas del ${moment(range.start).format('lll')} al ${moment(
            range.end
          ).format('lll')}`
        },
        {
          pageSetup: { fitToPage: true, orientation: 'landscape' }
        }
      );

      const sums = {
        product: 0,
        totalWeight: 0,
        subtotal: 0,
        tax: 0,
        totalPrice: 0
      };

      const addClient = ({ client, tickets, totalWeight, subtotal, tax, totalPrice }) => {
        const clientInfoRow = {
          rfc: client[0].rfc,
          businessName: client[0].businessName
        };

        worksheet.addRow(clientInfoRow);
        Object.keys(clientInfoRow).forEach(key => {
          worksheet.lastRow.getCell(key).font = {
            size: 12,
            bold: true
          };
        });

        let isCreditRow;

        tickets.forEach(ticket => {
          if (!isCreditRow && ticket.credit) isCreditRow = true;

          const ticketRow = {
            folio: ticket.folio,
            out: ticket.out,
            plates: ticket.truck[0].plates,
            product: ticket.product[0].name,
            totalWeight: format.number(ticket.totalWeight),
            subtotal: format.number(ticket.subtotal),
            tax: format.number(ticket.tax),
            totalPrice: format.number(ticket.totalPrice),
            credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
            bill: ticket.bill ? 'FACTURA' : 'REMISIÓN'
          };

          worksheet.addRow(ticketRow);
        });

        const resultsRow = {
          product: tickets.length,
          totalWeight: `${format.number(totalWeight)} tons`,
          subtotal: `${format.currency(subtotal)}`,
          tax: `${format.currency(tax)}`,
          totalPrice: `${format.currency(totalPrice)}`
        };

        sums.product += tickets.length;
        sums.totalWeight += totalWeight;
        sums.subtotal += subtotal;
        sums.tax += tax;
        sums.totalPrice += totalPrice;

        worksheet.addRow(resultsRow);
        Object.keys(resultsRow).forEach(key => {
          const row = worksheet.lastRow.getCell(key);
          row.border = {
            top: { style: 'medium' }
          };
          row.font = {
            size: 12,
            bold: true
          };
        });

        worksheet.addRow({});
      };

      clients.forEach(addClient);
      worksheet.addRow({});
      const resultsRow = {
        plates: 'Total',
        product: format.number(sums.product),
        totalWeight: `${format.number(sums.totalWeight)} tons`,
        subtotal: format.currency(sums.subtotal),
        tax: format.currency(sums.tax),
        totalPrice: format.currency(sums.totalPrice)
      };
      worksheet.addRow(resultsRow);
      Object.keys(resultsRow).forEach(key => {
        const row = worksheet.lastRow.getCell(key);
        row.border = {
          top: { style: 'medium' }
        };
        row.font = {
          size: 12,
          bold: true
        };
      });
      worksheet.addRow({});

      const buffer = await workbook.xlsx.writeBuffer();

      return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
        'base64'
      )}`;
    }
  ),
  ticketsSummaryByDateXLS: authenticated(
    async (
      _,
      {
        range = { start: '1970-01-01T00:00:00.000Z', end: '2100-12-31T00:00:00.000Z' },
        turnId,
        billType,
        paymentType
      }
    ) => {
      const query = {
        deleted: false,
        disabled: false,
        out: { $gte: new Date(range.start), $lte: new Date(range.end) },
        totalPrice: { $exists: true },
        outTruckImage: { $exists: true }
      };

      if (turnId) {
        query.turn = turnId;
      }

      if (billType) {
        if (billType === 'BILL') query.tax = { $gt: 0 };
        if (billType === 'REMISSION') query.tax = { $eq: 0 };
      }

      if (paymentType) {
        if (paymentType === 'CASH') query.credit = false;
        if (paymentType === 'CREDIT') query.credit = true;
      }

      const tickets = await Ticket.find(query).populate('client product truck');

      const attributes = [
        {
          header: 'Folio',
          key: 'folio'
        },
        {
          header: 'Fecha',
          key: 'out'
        },
        {
          header: 'Cliente',
          key: 'businessName'
        },
        {
          header: 'Camión',
          key: 'plates'
        },
        {
          header: 'Producto',
          key: 'product'
        },
        {
          header: 'Peso',
          key: 'totalWeight'
        },
        {
          header: 'Importe Producto',
          key: 'subtotal'
        },
        {
          header: 'Impuesto',
          key: 'tax'
        },
        {
          header: 'Importe',
          key: 'totalPrice'
        },
        {
          header: 'Tipo de pago',
          key: 'credit'
        },
        {
          header: 'Tipo de boleta',
          key: 'ticketType'
        },
        {
          header: 'Status',
          key: 'status'
        }
      ];

      for (let i = 0; i < attributes.length; i++) attributes[i] = { ...attributes[i], width: 15 };

      const workbook = createWorkbook();

      const worksheet = createWorksheet(
        workbook,
        {
          name: 'BoletasFecha',
          columns: attributes,
          date: new Date(),
          title: `Boletas por fecha del ${moment(range.start).format('lll')} al ${moment(
            range.end
          ).format('lll')}`
        },
        {
          pageSetup: { fitToPage: true, orientation: 'landscape' }
        }
      );

      const sums = {
        product: 0,
        totalWeight: 0,
        subtotal: 0,
        tax: 0,
        totalPrice: 0
      };

      tickets.forEach(ticket => {
        const ticketRow = {
          folio: ticket.folio,
          out: moment(ticket.out).format('LLL'),
          businessName: ticket.client.businessName,
          plates: ticket.truck.plates,
          product: ticket.product.name,
          totalWeight: format.number(ticket.totalWeight),
          subtotal: format.number(ticket.totalPrice - ticket.tax),
          tax: format.number(ticket.tax || 0),
          totalPrice: format.number(ticket.totalPrice),
          credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
          ticketType: ticket.tax > 0 ? 'FACTURA' : 'REMISIÓN',
          status: !ticket.isBilled ? '<Por facturar>' : ticket.tax ? '<Remisionada>' : '<Facturada>'
        };

        sums.product++;
        sums.totalWeight += ticket.totalWeight;
        sums.subtotal += ticket.totalPrice - (ticket.tax || 0);
        sums.tax += ticket.tax || 0;
        sums.totalPrice += ticket.totalPrice;

        worksheet.addRow(ticketRow);
      });

      const resultsRow = {
        plates: 'Total',
        product: format.number(sums.product),
        totalWeight: `${format.number(sums.totalWeight)} tons`,
        subtotal: format.currency(sums.subtotal),
        tax: format.currency(sums.tax),
        totalPrice: format.currency(sums.totalPrice)
      };

      worksheet.addRow(resultsRow);

      Object.keys(resultsRow).forEach(key => {
        const row = worksheet.lastRow.getCell(key);
        row.border = {
          top: { style: 'medium' }
        };
        row.font = {
          size: 12,
          bold: true
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
        'base64'
      )}`;
    }
  ),
  ticketsAuxiliarySalesXLS: async (
    _,
    { month = moment(), workingDays, workingDaysPassed, excluded = [] }
  ) => {
    const $match = {
      deleted: false,
      disabled: false,
      out: {
        $gte: new Date(moment(month)?.startOf('month')),
        $lte: new Date(moment(month).endOf('month'))
      },
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true }
    };

    const [
      excludedProducts,
      products,
      byRockAndDay,
      byDay,
      excludedByDay,
      notExcludedByDay,
      byRock,
      totals,
      excludedTotals,
      notExcludedTotals
    ] = await Promise.all([
      // Get excluded rocks to list them
      Rock.find({ _id: { $in: excluded } }),
      // Get all rocks to reconstruct columns
      Rock.find(),
      // Get totalWeight by rock and for each day of the month
      Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
              rock: '$product'
            },
            totalWeight: { $sum: '$totalWeight' }
          }
        }
      ]),
      // Get totalWeight and total sales of every product by day of the month
      Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get totalWeight and total sales of excluded products by day of the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $in: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get totalWeight and total sales of not excluded products by day of the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $nin: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: { $dayOfMonth: { date: '$out', timezone: 'America/Monterrey' } },
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get totalWeight by rock
      Ticket.aggregate([
        {
          $match
        },
        { $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' } },
        {
          $group: {
            _id: '$product',
            totalWeight: { $sum: '$totalWeight' }
          }
        }
      ]),
      // Get total weight and total asles for every product in the month
      Ticket.aggregate([
        {
          $match
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get total weight and total asles for every product in the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $in: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ]),
      // Get total weight and total asles for every product in the month
      Ticket.aggregate([
        {
          $match: {
            ...$match,
            product: { $nin: excluded.map(id => Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$totalWeight' },
            total: { $sum: { $subtract: ['$totalPrice', '$tax'] } }
          }
        }
      ])
    ]);

    // IDK Why but sometimes this aggregate array its empty when no data.
    // This is just to prevent formulaes to explode :v
    if (notExcludedTotals.length === 0) {
      notExcludedTotals.push({
        _id: null,
        totalWeight: 0,
        total: 0
      });
    }

    if (excludedTotals.length === 0) {
      excludedTotals.push({
        _id: null,
        totalWeight: 0,
        total: 0
      });
    }

    const workbook = createWorkbook();

    const rockColumns = products.map(({ name }) => ({ header: name, key: name }));

    const columns = [
      {
        header: 'DIA',
        key: 'day',
        width: 15
      },
      ...rockColumns,
      {
        header: 'TOTAL TON',
        key: 'totalWeight',
        width: 15
      },
      {
        header: 'VENTAS NETAS',
        key: 'netSales',
        width: 15
      },
      {
        header: 'PRECIO PROMEDIO',
        key: 'avgPrice',
        width: 15
      },
      {
        header: 'TOTAL M3',
        key: 'totalM3',
        width: 15
      },
      {
        header: 'TON LIMPIAS *',
        key: 'totalWeightNotExcluded',
        width: 15
      },
      {
        header: 'IMPORTE LIMPIO *',
        key: 'netSalesNotExcluded',
        width: 15
      },
      {
        header: 'PRECIO PROMEDIO LIMPIO *',
        key: 'avgPriceNotExcluded',
        width: 15
      },
      {
        header: 'TON SUCIAS *',
        key: 'totalWeightExcluded',
        width: 15
      },
      {
        header: 'IMPORTE SUCIAS *',
        key: 'netSalesExcluded',
        width: 15
      },
      {
        header: 'PRECIO PROMEDIO SUCIO *',
        key: 'avgPriceExcluded',
        width: 15
      }
    ];

    const worksheet = createWorksheet(
      workbook,
      {
        name: 'AuxiliarVentas',
        columns,
        date: new Date(),
        title: `Auxiliar de ventas de ${moment(month).format('MMMM Y')}`
      },
      {
        pageSetup: { fitToPage: true, orientation: 'landscape' }
      }
    );

    // Style title
    const titleRow = worksheet.getRow(headerRows);
    titleRow.height = 25;
    titleRow.eachCell((cell, colNumber) => {
      if (colNumber < 2 || colNumber >= worksheet.getColumn('netSales').number) {
        cell.fill = solidFill('C0C0C0');
      } else {
        cell.fill = solidFill('FFFF99');
      }
      cell.alignment = { wrapText: true, horizontal: 'center' };
    });

    const dayRows = [];
    for (let i = 0; i < moment(month).daysInMonth(); i++) dayRows.push({});

    byRockAndDay.forEach(({ _id, totalWeight }) => {
      dayRows[_id.day - 1][_id.rock[0].name] = totalWeight;
    });

    byDay.forEach(({ _id: day, total, totalWeight }) => {
      dayRows[day - 1].totalWeight = totalWeight;
      dayRows[day - 1].netSales = total;
      dayRows[day - 1].totalM3 = totalWeight ? totalWeight / 1.52 : undefined;
      dayRows[day - 1].avgPrice = total / totalWeight;
    });

    excludedByDay.forEach(({ _id: day, total, totalWeight }) => {
      dayRows[day - 1].totalWeightExcluded = totalWeight;
      dayRows[day - 1].netSalesExcluded = total;
      dayRows[day - 1].avgPriceExcluded = total / totalWeight;
    });

    notExcludedByDay.forEach(({ _id: day, total, totalWeight }) => {
      dayRows[day - 1].totalWeightNotExcluded = totalWeight;
      dayRows[day - 1].netSalesNotExcluded = total;
      dayRows[day - 1].avgPriceNotExcluded = total / totalWeight;
    });

    dayRows.forEach((row, index) => {
      worksheet.addRow({ ...row, day: index + 1 });
    });

    // Get important columns
    const lastProductCellLetter = columnToLetter(worksheet.getColumn('totalWeight').number - 1);
    const totalWeightCellLetter = columnToLetter(worksheet.getColumn('totalWeight').number);
    const totalWeightExcludedCellLetter = columnToLetter(
      worksheet.getColumn('totalWeightExcluded').number
    );
    const totalWeightNotExcludedCellLetter = columnToLetter(
      worksheet.getColumn('totalWeightNotExcluded').number
    );
    const netSalesCellLetter = columnToLetter(worksheet.getColumn('netSales').number);
    const netSalesExcludedCellLetter = columnToLetter(
      worksheet.getColumn('netSalesExcluded').number
    );
    const netSalesNotExcludedCellLetter = columnToLetter(
      worksheet.getColumn('netSalesNotExcluded').number
    );
    const avgPriceCellLetter = columnToLetter(worksheet.getColumn('avgPrice').number);

    // Calculate total formulaes
    worksheet.eachRow(row => {
      // Less than 7 is header
      if (row.number > headerRows) {
        const totalWeightCell = row.getCell('totalWeight');
        const netSalesCell = row.getCell('netSales');
        const avgPriceCell = row.getCell('avgPrice');
        const totalM3Cell = row.getCell('totalM3');

        if (totalWeightCell.value) {
          avgPriceCell.value = {
            formula: `${netSalesCellLetter}${row.number}/${totalWeightCellLetter}${row.number}`,
            result: netSalesCell.value / totalWeightCell.value
          };
          totalWeightCell.value = {
            // Will always be B since A is for Days
            formula: `SUMA(B${row.number}:${lastProductCellLetter}${row.number})`,
            result: totalWeightCell.value || 0
          };
          totalM3Cell.value = {
            formula: `${totalWeightCellLetter}${row.number}/1.52`,
            result: totalM3Cell.value || 0
          };
        }
      }
    });

    // Add accumulated row
    const accumulatedRow = {
      day: 'ACUMULADO'
    };

    byRock.forEach(({ _id, totalWeight }) => {
      accumulatedRow[_id[0].name] = totalWeight;
    });

    accumulatedRow.totalWeight = totals[0]?.totalWeight;
    accumulatedRow.totalWeightExcluded = excludedTotals[0]?.totalWeight;
    accumulatedRow.totalWeightNotExcluded = notExcludedTotals[0]?.totalWeight;
    accumulatedRow.totalM3 = totals[0]?.totalWeight / 1.52;
    accumulatedRow.netSales = totals[0]?.total;
    accumulatedRow.netSalesExcluded = excludedTotals[0]?.total;
    accumulatedRow.netSalesNotExcluded = notExcludedTotals[0]?.total;

    worksheet.addRow(accumulatedRow);

    const parsedAccumulatedRow = worksheet.getRow(worksheet.rowCount);

    // Add forecast row
    const forecastRow = {
      day: 'TENDENCIA'
    };
    byRock.forEach(({ _id, totalWeight }) => {
      forecastRow[_id[0].name] = (totalWeight / workingDaysPassed) * workingDays;
    });

    forecastRow.totalWeight = (totals[0]?.totalWeight / workingDaysPassed) * workingDays;
    forecastRow.totalWeightExcluded =
      (excludedTotals[0]?.totalWeight / workingDaysPassed) * workingDays;
    forecastRow.totalWeightNotExcluded =
      (notExcludedTotals[0]?.totalWeight / workingDaysPassed) * workingDays;
    forecastRow.totalM3 = (totals[0]?.totalWeight / 1.52 / workingDaysPassed) * workingDays;
    forecastRow.netSales = (totals[0]?.total / workingDaysPassed) * workingDays;
    forecastRow.netSalesExcluded = (excludedTotals[0]?.total / workingDaysPassed) * workingDays;
    forecastRow.netSalesNotExcluded =
      (notExcludedTotals[0]?.total / workingDaysPassed) * workingDays;
    forecastRow.avgPrice = forecastRow.netSales / forecastRow.totalWeight;
    forecastRow.avgPriceExcluded = forecastRow.netSalesExcluded / forecastRow.totalWeightExcluded;
    forecastRow.avgPriceNotExcluded =
      forecastRow.netSalesNotExcluded / forecastRow.totalWeightNotExcluded;

    worksheet.addRow(forecastRow);

    const parsedForecastRow = worksheet.getRow(worksheet.rowCount);

    // Add percentage row
    const percentageRow = {
      day: '% Producto'
    };

    byRock.forEach(({ _id }) => {
      percentageRow[_id[0].name] = forecastRow[_id[0].name] / forecastRow.totalWeight;
    });

    percentageRow.totalWeight = forecastRow.totalWeight / forecastRow.totalWeight;
    percentageRow.totalWeightExcluded = forecastRow.totalWeightExcluded / forecastRow.totalWeight;
    percentageRow.totalWeightNotExcluded =
      forecastRow.totalWeightNotExcluded / forecastRow.totalWeight;
    percentageRow.totalWeight = forecastRow.totalWeight / forecastRow.totalWeight;
    percentageRow.netSales = forecastRow.netSales / forecastRow.netSales;
    percentageRow.netSalesExcluded = forecastRow.netSalesExcluded / forecastRow.netSales;
    percentageRow.netSalesNotExcluded = forecastRow.netSalesNotExcluded / forecastRow.netSales;

    worksheet.addRow(percentageRow);

    const parsedPercentageRow = worksheet.getRow(worksheet.rowCount);

    worksheet.addRow({});

    // Add reference day cells
    worksheet.addRow({
      day: `* Los productos excluídos (sucios) son: ${list(
        excludedProducts.map(({ name }) => name)
      )}`,
      totalWeight: 'Días transcurridos hábiles (efectivos)',
      avgPrice: workingDaysPassed
    });

    const workingDaysPassedRow = worksheet.getRow(worksheet.rowCount);
    workingDaysPassedRow.getCell('avgPrice').fill = solidFill('FF6600');

    worksheet.addRow({
      totalWeight: 'Días hábiles del mes',
      avgPrice: workingDays
    });

    const workingDaysRow = worksheet.getRow(worksheet.rowCount);
    workingDaysRow.getCell('avgPrice').fill = solidFill('FF6600');

    worksheet.addRow({});

    // Add global indicators
    worksheet.addRow({
      totalWeight: 'Promedio Vta Diaria',
      avgPrice: totals[0]?.totalWeight / workingDaysPassed
    });

    const dailyAvgSalesRow = worksheet.getRow(worksheet.rowCount);
    const dailyAvgSalesCell = dailyAvgSalesRow.getCell('avgPrice');
    dailyAvgSalesCell.fill = solidFill('CCFFFF');
    dailyAvgSalesCell.value = {
      formula: `${totalWeightCellLetter}${parsedAccumulatedRow.number}/${avgPriceCellLetter}${workingDaysPassedRow.number}`,
      value: dailyAvgSalesCell.value
    };

    worksheet.addRow({
      totalWeight: 'Tendencia Vta',
      avgPrice: (totals[0]?.totalWeight / workingDaysPassed) * workingDays
    });

    const salesForecastRow = worksheet.getRow(worksheet.rowCount);
    const salesForecastCell = salesForecastRow.getCell('avgPrice');
    salesForecastCell.fill = solidFill('CCFFFF');
    salesForecastCell.value = {
      formula: `${avgPriceCellLetter}${dailyAvgSalesRow.number}*${avgPriceCellLetter}${workingDaysRow.number}`,
      value: salesForecastCell.value
    };

    worksheet.addRow({
      totalWeight: 'Promedio $$ Diario',
      avgPrice: forecastRow.netSales / workingDays
    });

    const dailyAvgMoneyRow = worksheet.getRow(worksheet.rowCount);
    const dailyAvgMoneyCell = dailyAvgMoneyRow.getCell('avgPrice');
    dailyAvgMoneyCell.fill = solidFill('CCFFFF');
    dailyAvgMoneyCell.value = {
      formula: `${netSalesCellLetter}${parsedForecastRow.number}/${avgPriceCellLetter}${workingDaysRow.number}`,
      value: dailyAvgMoneyCell.value
    };

    worksheet.addRow({
      totalWeight: 'Tendencia en pesos $$',
      avgPrice: (forecastRow.netSales / workingDays) * workingDays
    });

    const forecastInMoneyRow = worksheet.getRow(worksheet.rowCount);
    const forecastInMoneyCell = forecastInMoneyRow.getCell('avgPrice');
    forecastInMoneyCell.fill = solidFill('CCFFFF');
    forecastInMoneyCell.value = {
      formula: `${avgPriceCellLetter}${dailyAvgMoneyRow.number}*${avgPriceCellLetter}${workingDaysRow.number}`,
      value: forecastInMoneyCell.value
    };

    // Style accumulated row and generate formulaes
    for (let column = 1; column <= worksheet.columnCount; column++) {
      const cell = parsedAccumulatedRow.getCell(column);
      cell.fill = solidFill('FFFF99');
      if (column > 1 && cell.value) {
        cell.value = {
          formula: `SUMA(${columnToLetter(column)}${headerRows + 1}:${columnToLetter(
            column
          )}${headerRows + moment(month).daysInMonth()})`,
          result: cell.value || 0
        };
      }
    }

    const accumulatedAvgPrice = parsedAccumulatedRow.getCell('avgPrice');
    const accumulatedAvgPriceExcluded = parsedAccumulatedRow.getCell('avgPriceExcluded');
    const accumulatedAvgPriceNotExcluded = parsedAccumulatedRow.getCell('avgPriceNotExcluded');
    accumulatedAvgPrice.value = {
      formula: `${netSalesCellLetter}${parsedAccumulatedRow.number}/${totalWeightCellLetter}${parsedAccumulatedRow.number}`,
      result: accumulatedAvgPrice.value
    };
    accumulatedAvgPriceExcluded.value = {
      formula: `${netSalesExcludedCellLetter}${parsedAccumulatedRow.number}/${totalWeightExcludedCellLetter}${parsedAccumulatedRow.number}`,
      result: accumulatedAvgPriceExcluded.value
    };
    accumulatedAvgPriceNotExcluded.value = {
      formula: `${netSalesNotExcludedCellLetter}${parsedAccumulatedRow.number}/${totalWeightNotExcludedCellLetter}${parsedAccumulatedRow.number}`,
      result: accumulatedAvgPriceNotExcluded.value
    };

    // Style forecast row and generate formulaes
    const workingDaysPassedRowNumber = workingDaysPassedRow.number;
    const workingDaysRowNumber = workingDaysRow.number;
    for (let column = 1; column <= worksheet.columnCount; column++) {
      const cell = parsedForecastRow.getCell(column);
      cell.fill = solidFill('FFFF99');
      cell.font = { bold: true };

      if (column > 1 && cell.value) {
        if (column === worksheet.getColumn('avgPrice').number) {
          cell.value = {
            formula: `${netSalesCellLetter}${parsedForecastRow.number}/${totalWeightCellLetter}${parsedForecastRow.number}`,
            result: cell.value || 0
          };
        } else if (column === worksheet.getColumn('avgPriceExcluded').number) {
          cell.value = {
            formula: `${netSalesExcludedCellLetter}${parsedForecastRow.number}/${totalWeightExcludedCellLetter}${parsedForecastRow.number}`,
            result: cell.value || 0
          };
        } else if (column === worksheet.getColumn('avgPriceNotExcluded').number) {
          cell.value = {
            formula: `${netSalesNotExcludedCellLetter}${parsedForecastRow.number}/${totalWeightNotExcludedCellLetter}${parsedForecastRow.number}`,
            result: cell.value || 0
          };
        } else {
          cell.value = {
            formula: `${columnToLetter(column)}${
              parsedAccumulatedRow.number
            }/$${avgPriceCellLetter}$${workingDaysPassedRowNumber}*$${avgPriceCellLetter}$${workingDaysRowNumber}`,
            result: cell.value || 0
          };
        }
      }
    }

    // Style percentage row and generate formulaes
    for (let column = 1; column <= worksheet.columnCount; column++) {
      const cell = parsedPercentageRow.getCell(column);
      cell.fill = solidFill('FFFF99');
      if (column > 1 && cell.value) {
        cell.value = {
          formula: `$${columnToLetter(column)}${
            parsedForecastRow.number
          }/${totalWeightCellLetter}$${parsedForecastRow.number}`,
          result: cell.value || 0
        };
      }
    }

    const percentageNetSalesCell = parsedPercentageRow.getCell('netSales');
    const percentageNetSalesExcludedCell = parsedPercentageRow.getCell('netSalesExcluded');
    const percentageNetSalesNotExcludedCell = parsedPercentageRow.getCell('netSalesNotExcluded');
    percentageNetSalesCell.value = {
      formula: `${netSalesCellLetter}${parsedForecastRow.number}/${netSalesCellLetter}${parsedForecastRow.number}`,
      result: percentageNetSalesCell.value.value
    };
    percentageNetSalesExcludedCell.value = {
      formula: `${netSalesExcludedCellLetter}${parsedForecastRow.number}/${netSalesCellLetter}${parsedForecastRow.number}`,
      result: percentageNetSalesExcludedCell.value.result
    };
    percentageNetSalesNotExcludedCell.value = {
      formula: `${netSalesNotExcludedCellLetter}${parsedForecastRow.number}/${netSalesCellLetter}${parsedForecastRow.number}`,
      result: percentageNetSalesNotExcludedCell.value.result
    };

    // Style the entire sheet
    for (let row = headerRows; row <= worksheet.rowCount; row++) {
      const actualRow = worksheet.getRow(row);
      for (let col = 1; col <= worksheet.columnCount; col++) {
        const cell = actualRow.getCell(col);
        cell.font = { ...cell.font, size: 9 };

        if (row <= worksheet.rowCount - 8) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }

        if (row > headerRows && row <= headerRows + moment(month).daysInMonth()) {
          if (
            col === worksheet.getColumn('totalWeight').number ||
            col === worksheet.getColumn('avgPrice').number ||
            col === worksheet.getColumn('avgPriceExcluded').number ||
            col === worksheet.getColumn('avgPriceNotExcluded').number
          ) {
            cell.fill = solidFill('3366FF');
          } else if (col === worksheet.getColumn('totalM3').number) {
            cell.fill = solidFill('99CC00');
          }
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  },
  ticketTimesXLS: authenticated(async (_, { date = {}, turnId, rocks }) => {
    const $match = {
      deleted: false,
      disabled: false,
      out: {
        $gte: new Date(date.start || '1970-01-01T00:00:00.000Z'),
        $lte: new Date(date.end || '2100-12-31T00:00:00.000Z')
      },
      totalPrice: { $exists: true },
      outTruckImage: { $exists: true },
      excludeFromTimeMetrics: { $ne: true }
    };

    if (turnId) $match.turn = Types.ObjectId(turnId);
    if (rocks && rocks.length > 0)
      $match.product = { $in: rocks.map(rockId => Types.ObjectId(rockId)) };

    const [products, globalTimes, timesByProduct, ticketList] = await Promise.all([
      Rock.find(),
      Ticket.aggregate([
        {
          $match
        },
        {
          $group: {
            _id: null,
            minTime: { $min: { $subtract: ['$out', '$in'] } },
            avgTime: { $avg: { $subtract: ['$out', '$in'] } },
            maxTime: { $max: { $subtract: ['$out', '$in'] } }
          }
        }
      ]),
      Ticket.aggregate([
        {
          $match
        },
        {
          $group: {
            _id: '$product',
            minTime: { $min: { $subtract: ['$out', '$in'] } },
            avgTime: { $avg: { $subtract: ['$out', '$in'] } },
            maxTime: { $max: { $subtract: ['$out', '$in'] } },
            totalWeight: { $sum: '$totalWeight' }
          }
        }
      ]),
      Ticket.aggregate([
        {
          $match
        },
        {
          $lookup: { from: 'users', localField: 'client', foreignField: '_id', as: 'client' }
        },
        {
          $lookup: { from: 'trucks', localField: 'truck', foreignField: '_id', as: 'truck' }
        },
        {
          $lookup: { from: 'rocks', localField: 'product', foreignField: '_id', as: 'product' }
        },
        {
          $unwind: '$client'
        },
        {
          $unwind: '$truck'
        },
        {
          $unwind: '$product'
        },
        { $addFields: { productArray: [{ k: { $toString: '$product._id' }, v: '$totalWeight' }] } },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                { $arrayToObject: '$productArray' },
                {
                  date: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$out',
                      timezone: 'America/Monterrey'
                    }
                  },
                  folio: '$folio',
                  plates: '$truck.plates',
                  clientUniqueId: '$client.uniqueId',
                  businessName: '$client.businessName',
                  in: {
                    $dateToString: {
                      format: '%H:%M:%S',
                      date: '$in',
                      timezone: 'America/Monterrey'
                    }
                  },
                  out: {
                    $dateToString: {
                      format: '%H:%M:%S',
                      date: '$out',
                      timezone: 'America/Monterrey'
                    }
                  },
                  timeIn: { $subtract: ['$out', '$in'] }
                }
              ]
            }
          }
        }
      ])
    ]);

    const workbook = createWorkbook();

    const rockColumns = products.map(({ id, name }) => ({ header: name, key: id }));

    const columns = [
      {
        header: 'Fecha',
        key: 'date',
        width: 15
      },
      {
        header: 'Folio',
        key: 'folio',
        width: 15
      },
      {
        header: 'Placas',
        key: 'plates',
        width: 15
      },
      {
        header: 'Código de cliente',
        key: 'clientUniqueId',
        width: 15
      },
      {
        header: 'Cliente',
        key: 'businessName',
        width: 35
      },
      {
        header: 'Entrada',
        key: 'in',
        width: 15
      },
      {
        header: 'Salida',
        key: 'out',
        width: 15
      },
      {
        header: 'Estadía',
        key: 'timeIn',
        width: 15
      },
      ...rockColumns
    ];

    const worksheet = createWorksheet(
      workbook,
      {
        name: 'ReporteTiempos',
        columns,
        date: new Date(),
        title: `Reporte de tiempos del ${moment(date.start || '1970-01-01T00:00:00.000Z').format(
          'MMMM Y'
        )} al ${moment(date.end || '2100-12-31T00:00:00.000Z').format('MMMM Y')}`
      },
      {
        pageSetup: { fitToPage: true, orientation: 'landscape' }
      }
    );

    ticketList.forEach(ticket => {
      ticket.timeIn = format.time(ticket.timeIn);
      worksheet.addRow(ticket);
    });

    const weightsRow = { in: 'Suma de pesos' };
    const avgTimes = { in: 'Tiempo promedio', timeIn: format.time(globalTimes[0]?.avgTime) };
    const maxTimes = { in: 'Tiempo máximo', timeIn: format.time(globalTimes[0]?.maxTime) };
    const minTimes = { in: 'Tiempo mínimo', timeIn: format.time(globalTimes[0]?.minTime) };
    timesByProduct.forEach(({ _id, totalWeight, avgTime, maxTime, minTime }) => {
      weightsRow[_id] = totalWeight;
      avgTimes[_id] = format.time(avgTime);
      maxTimes[_id] = format.time(maxTime);
      minTimes[_id] = format.time(minTime);
    });
    worksheet.addRow(weightsRow);
    worksheet.addRow(avgTimes);
    worksheet.addRow(maxTimes);
    worksheet.addRow(minTimes);

    const buffer = await workbook.xlsx.writeBuffer();

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buffer.toString(
      'base64'
    )}`;
  })
};

export default ticketReports;
