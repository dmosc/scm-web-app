import { format } from '../../../../../../src/utils/functions';
import { createWorksheet } from '../../../../../utils/reports';
import periods from '../../../../../../src/utils/enums/periods';

/* eslint-disable no-param-reassign */
const turnReportsUtils = {
  turnSummaryXLS: {
    addClient: (
      worksheet,
      cashSums,
      creditSums,
      { client, tickets, totalWeight, subtotal, tax, totalPrice }
    ) => {
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
          subtotal: format.currency(ticket.subtotal),
          tax: format.currency(ticket.tax),
          totalPrice: format.currency(ticket.totalPrice),
          credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
          bill: ticket.bill ? 'FACTURA' : 'REMISIÓN',
          cashier: `${ticket.cashier[0]?.firstName} ${ticket.cashier[0]?.lastName}`
        };

        worksheet.addRow(ticketRow);
      });

      const resultsRow = {
        product: tickets.length,
        totalWeight: `${format.number(totalWeight)} tons`,
        subtotal: format.currency(subtotal),
        tax: format.currency(tax),
        totalPrice: format.currency(totalPrice)
      };

      if (!isCreditRow) {
        cashSums.product += tickets.length;
        cashSums.totalWeight += totalWeight;
        cashSums.subtotal += subtotal;
        cashSums.tax += tax;
        cashSums.totalPrice += totalPrice;
      }

      if (isCreditRow) {
        creditSums.product += tickets.length;
        creditSums.totalWeight += totalWeight;
        creditSums.subtotal += subtotal;
        creditSums.tax += tax;
        creditSums.totalPrice += totalPrice;
      }

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
    },
    addTicketTypeBlock: (title, worksheet, clientsType, cashSums, creditSums, sumsToShow) => {
      worksheet.addRow({});
      worksheet.addRow({
        rfc: 'CONTADO'
      });
      worksheet.lastRow.getCell('rfc').font = {
        size: 14,
        bold: true
      };
      worksheet.addRow({});
      clientsType.forEach(client =>
        turnReportsUtils.turnSummaryXLS.addClient(worksheet, cashSums, creditSums, client)
      );
      worksheet.addRow({});

      const resultsRow = {
        plates: 'Total',
        product: format.number(sumsToShow.product),
        totalWeight: `${format.currency(sumsToShow.totalWeight)} tons`,
        subtotal: format.currency(sumsToShow.subtotal),
        tax: format.currency(sumsToShow.tax),
        totalPrice: format.currency(sumsToShow.totalPrice)
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
    },
    addWorksheetByTicketType: (workbook, clientsCash, clientsCredit, attributes, turn) => {
      const worksheet = createWorksheet(
        workbook,
        {
          name: 'Por tipo',
          columns: attributes,
          date: turn.end,
          title: `Boletas por tipo de pago del corte de turno: ${turn.uniqueId}  (${
            periods[turn.period]
          })`
        },
        {
          pageSetup: { fitToPage: true, orientation: 'landscape' }
        }
      );

      const cashSums = {
        product: 0,
        totalWeight: 0,
        subtotal: 0,
        tax: 0,
        totalPrice: 0
      };

      const creditSums = {
        product: 0,
        totalWeight: 0,
        subtotal: 0,
        tax: 0,
        totalPrice: 0
      };

      if (clientsCash.length > 0)
        turnReportsUtils.turnSummaryXLS.addTicketTypeBlock(
          'CONTADO',
          worksheet,
          clientsCash,
          cashSums,
          creditSums,
          cashSums
        );

      if (clientsCredit.length > 0)
        turnReportsUtils.turnSummaryXLS.addTicketTypeBlock(
          'CRÉDITO',
          worksheet,
          clientsCredit,
          cashSums,
          creditSums,
          creditSums
        );
    },
    addTickets: (worksheet, title, tickets) => {
      worksheet.addRow({
        rfc: title
      });
      worksheet.lastRow.getCell('rfc').font = {
        bold: true
      };

      const sums = {
        product: tickets.length,
        totalWeight: 0,
        subtotal: 0,
        tax: 0,
        totalPrice: 0
      };

      tickets.forEach(ticket => {
        sums.totalWeight += ticket.totalWeight;
        sums.subtotal += ticket.totalPrice - ticket.tax;
        sums.tax += ticket.tax;
        sums.totalPrice += ticket.totalPrice;

        const ticketRow = {
          folio: ticket.folio,
          out: ticket.out,
          plates: ticket.truck[0].plates,
          product: ticket.product[0].name,
          totalWeight: format.number(ticket.totalWeight),
          subtotal: format.currency(ticket.totalPrice - ticket.tax),
          tax: format.currency(ticket.tax),
          totalPrice: format.currency(ticket.totalPrice),
          credit: ticket.credit ? 'CRÉDITO' : 'CONTADO',
          bill: ticket.bill ? 'FACTURA' : 'REMISIÓN',
          cashier: `${ticket.cashier[0]?.firstName} ${ticket.cashier[0]?.lastName}`
        };

        worksheet.addRow(ticketRow);
      });

      worksheet.addRow({});

      const resultsRow = {
        plates: 'Total',
        product: format.number(sums.product),
        totalWeight: `${format.currency(sums.totalWeight)} tons`,
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
    },
    addWorksheetByCashier: (workbook, tickets, attributes, turn) => {
      attributes[0].header = '';
      attributes[1].header = '';
      attributes.pop();

      const worksheet = createWorksheet(
        workbook,
        {
          name: 'Por cajero',
          columns: attributes,
          date: turn.end,
          title: `Boletas por cajero del corte de turno: ${turn.uniqueId}  (${
            periods[turn.period]
          })`
        },
        {
          pageSetup: { fitToPage: true, orientation: 'landscape' }
        }
      );

      const cashiersMap = {};

      tickets.forEach(ticket => {
        if (!cashiersMap[ticket.cashier[0]._id])
          cashiersMap[ticket.cashier[0]._id] = {
            name: `${ticket.cashier[0].firstName} ${ticket.cashier[0].lastName}`,
            cash: [],
            credit: []
          };

        const subkey = ticket.credit ? 'credit' : 'cash';

        cashiersMap[ticket.cashier[0]._id][subkey].push(ticket);
      });

      Object.keys(cashiersMap).forEach(cashierId => {
        worksheet.addRow({});
        worksheet.addRow({
          rfc: cashiersMap[cashierId].name
        });
        worksheet.lastRow.getCell('rfc').font = {
          size: 14,
          bold: true
        };
        if (cashiersMap[cashierId].cash.length)
          turnReportsUtils.turnSummaryXLS.addTickets(
            worksheet,
            'CONTADO',
            cashiersMap[cashierId].cash
          );
        if (cashiersMap[cashierId].credit.length)
          turnReportsUtils.turnSummaryXLS.addTickets(
            worksheet,
            'CRÉDITO',
            cashiersMap[cashierId].credit
          );
      });
    }
  }
};

export default turnReportsUtils;
