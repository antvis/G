const fs = require('fs');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

const sleep = (n) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, n);
  });
};

const diff = (src, target) => {
  const img1 = PNG.sync.read(fs.readFileSync(src));
  const img2 = PNG.sync.read(fs.readFileSync(target));
  const { width, height } = img1;
  return pixelmatch(img1.data, img2.data, null, width, height, { threshold: 0.1 });
};

module.exports = { sleep, diff };
