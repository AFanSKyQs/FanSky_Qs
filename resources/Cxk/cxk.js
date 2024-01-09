// 需要下载DOMParse
// fetch node 18原生支持，低版本得自己下载

const url = 'https://remeins.com/index/resimg/bqb/ikun/0';
const imagesFolder = './img/';

fetch(url)
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = doc.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      const src = images[i].getAttribute('src');
      downloadImage(src);
    }
  })
  .catch(error => {
    console.error('Error fetching URL:', error);
  });

function downloadImage(url) {
  const filename = url.substring(url.lastIndexOf('/') + 1);
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const file = new File([blob], filename, { type: blob.type });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
        document.body.removeChild(link);
      }, 0);
    })
    .catch(error => {
      console.error('Error downloading image:', error);
    });
}