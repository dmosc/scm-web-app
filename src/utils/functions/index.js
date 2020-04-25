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

export { printPDF };
