const path = require('path');
const { lstatSync, readdirSync } = require('fs');
const { exec } = require('child_process');

// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, '../packages');
const packages = readdirSync(basePath).filter((name) => {
  return lstatSync(path.join(basePath, name)).isDirectory();
});

// yarn link
packages.forEach((name) => {
  const packagePath = path.resolve(__dirname, `../packages/${name}`);
  exec(`cd ${packagePath} && pnpm link`);
});

// link to ./site
packages.forEach((name) => {
  exec(
    `cd ${path.resolve(__dirname, '../site')} && pnpm link "@antv/${name}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`${stdout}`);
    },
  );
});
