import fs from 'fs';
import { execSync } from 'child_process';
import console from 'console';

// Mark all current packages as latest
fs.readdirSync('./packages').forEach((packageName, index) => {
  if (packageName === 'g-devtool') return;

  const pkgJson = JSON.parse(
    fs.readFileSync(`./packages/${packageName}/package.json`, 'utf-8'),
  );

  const command = `npm dist-tag add ${pkgJson.name}@${pkgJson.version} latest`;
  console.log(`[${index}] ` + command);
  try {
    execSync(command);
  } catch (e) {
    console.log(e);
  }
});
