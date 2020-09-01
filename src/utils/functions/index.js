const printPDF = base64PDF =>
  new Promise(resolve => {
    let byteCharacters;
    if (base64PDF.includes('base64')) byteCharacters = atob(base64PDF.split(',')[1]);
    else byteCharacters = base64PDF;

    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'application/pdf' });

    const urlBlob = URL.createObjectURL(blob);
    const iframe = document.getElementById('print');
    iframe.src = urlBlob;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.focus();
        iframe.contentWindow.print();
        resolve();
      }, 100);
    };
  });

const format = {
  number: num => {
    let toFormat = num;

    if (typeof num === 'number') toFormat = Number(num);

    let formatted = toFormat.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // This is a special case when number is 4 digits long and needs a ,
    if (formatted.length === 7) formatted = `${formatted[0]},${formatted.substring(1)}`;

    return formatted;
  },
  currency: num => `$${format.number(num)}`,
  time: milliseconds => {
    let h;
    let m;
    let s;

    h = Math.floor(milliseconds / 1000 / 60 / 60);
    m = Math.floor((milliseconds / 1000 / 60 / 60 - h) * 60);
    s = Math.floor(((milliseconds / 1000 / 60 / 60 - h) * 60 - m) * 60);

    s < 10 ? (s = `0${s}`) : (s = `${s}`);
    m < 10 ? (m = `0${m}`) : (m = `${m}`);
    h < 10 ? (h = `0${h}`) : (h = `${h}`);

    return `${h}:${m}:${s}`;
  }
};

const list = toList => {
  let str = '';
  toList.forEach((value, index) => {
    if (index === toList.length - 2) {
      str += `${value} y `;
    } else if (index === toList.length - 1) {
      str += value;
    } else {
      str += `${value}, `;
    }
  });

  return str;
};

export { printPDF, format, list };
