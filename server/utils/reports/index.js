import ExcelJS from 'exceljs';
import moment from 'moment-timezone';

const createWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Grupo Emmont de México';
  workbook.lastModifiedBy = 'Grupo Emmont de México';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  return workbook;
};

// Used when operating based on header height.
// IF HEADER CONSTRUCT IS CHANGED, PLEASE UPDATE THIS
const headerRows = 6;

const createWorksheet = (workbook, { name, columns, title, date = Date.now() }, options = {}) => {
  const worksheet = workbook.addWorksheet(name, options);

  if (columns) {
    worksheet.columns = columns;

    columns.forEach(({ header, key }) => {
      const titleCell = worksheet.getRow(headerRows).getCell(key);
      const firstRow = worksheet.getRow(1).getCell(key);
      titleCell.value = header;
      firstRow.value = '';
    });

    const titlesRow = worksheet.getRow(6);
    titlesRow.font = {
      size: 12,
      bold: true
    };
    titlesRow.alignment = { vertical: 'middle', horizontal: 'center' };
    titlesRow.height = 20;

    const GEMSACell = worksheet.getCell('C2');
    GEMSACell.value = 'Grupo Emmont de México';
    GEMSACell.font = {
      size: 16,
      bold: true
    };

    const TitleCell = worksheet.getCell('C3');
    TitleCell.value = title || name;
    TitleCell.font = {
      size: 12,
      italic: true
    };

    const DateCell = worksheet.getCell('M3');
    DateCell.value = moment(date).format('L');

    const HourCell = worksheet.getCell('M4');
    HourCell.value = moment(date).format('LTS');
  }

  worksheet.views = [
    {
      state: 'frozen',
      xSplit: 0,
      ySplit: columns ? headerRows : headerRows - 1
    }
  ];

  return worksheet;
};

const columnToLetter = column => {
  let temp;
  let letter = '';

  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    // eslint-disable-next-line no-param-reassign
    column = (column - temp - 1) / 26;
  }
  return letter;
};

const solidFill = hexColor => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: {
    argb: hexColor
  }
});

export { createWorkbook, createWorksheet, columnToLetter, headerRows, solidFill };
