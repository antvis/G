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

/**
 * diff between PNGs
 */
const diff = (src, target, showMismatchedPixels = true) => {
  const img1 = PNG.sync.read(fs.readFileSync(src));
  const img2 = PNG.sync.read(fs.readFileSync(target));
  const { width, height } = img1;
  const maxError = 10;

  let diffPNG = null;
  let output = null;
  if (showMismatchedPixels) {
    diffPNG = new PNG({ width, height });
    output = diffPNG.data;
  }

  const mismatch = pixelmatch(img1.data, img2.data, output, width, height, {
    threshold: 0.1,
  });

  if (showMismatchedPixels && mismatch > maxError && diffPNG) {
    const diffPath = src.replace('.png', '.diff.png');
    fs.writeFileSync(diffPath, PNG.sync.write(diffPNG));
  }

  return mismatch;
};

/**
 * create PNG with rawdata
 * @see https://github.com/lukeapage/pngjs/blob/master/examples/newfile.js
 */
const createPNGFromRawdata = async (target, width, height, data) => {
  let newfile = new PNG({ width, height });
  for (let y = 0; y < newfile.height; y++) {
    for (let x = 0; x < newfile.width; x++) {
      let idx = (newfile.width * y + x) << 2;
      // flipY
      let idx2 = (newfile.width * (newfile.height - y) + x) << 2;
      newfile.data[idx] = data[idx2];
      newfile.data[idx + 1] = data[idx2 + 1];
      newfile.data[idx + 2] = data[idx2 + 2];
      newfile.data[idx + 3] = data[idx2 + 3];
    }
  }

  return new Promise((resolve) => {
    newfile
      .pack()
      .pipe(fs.createWriteStream(target))
      .on('finish', function () {
        resolve(newfile);
      });
  });
};

module.exports = { sleep, diff, createPNGFromRawdata };
