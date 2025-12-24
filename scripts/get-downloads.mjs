/**
 * A script to fetch and display npm download counts for all packages in a monorepo.
 *
 * This script is designed for monorepos where all packages are located in a top-level
 * 'packages/' directory. It automatically discovers all packages, then queries the official
 * npm downloads API to get statistics for a specified period and displays a simple
 * visualization of the package rankings.
 *
 * To use this script, run it from the root of your monorepo:
 *
 * Examples:
 * - To fetch last month's download count (default period):
 * node get-downloads.mjs
 *
 * - To fetch last week's download count:
 * node get-downloads.mjs --period=last-week
 *
 * The `--period` parameter accepts the following values:
 * - `last-day`
 * - `last-week`
 * - `last-month` (default)
 * - `last-year`
 * - A specific date range, e.g., `YYYY-MM-DD:YYYY-MM-DD`
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import https from 'node:https';
import process from 'node:process';

/**
 * Gets the download period from command line arguments.
 * @returns {string} The specified period, or 'last-month' by default.
 */
function getPeriodFromArgs() {
  const periodArg = process.argv.find((arg) => arg.startsWith('--period='));
  return periodArg ? periodArg.split('=')[1] : 'last-month';
}

const period = getPeriodFromArgs();
const packagesDir = join(process.cwd(), 'packages');

console.log('Fetching package names from packages/ directory...');

let packageNames = [];
try {
  const subDirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const dir of subDirs) {
    const packageJsonPath = join(packagesDir, dir, 'package.json');
    try {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      if (packageJson.name) {
        packageNames.push(packageJson.name);
      }
    } catch (e) {
      console.error(
        `Skipping directory '${dir}': Could not read package.json or name.`,
      );
    }
  }
} catch (e) {
  console.error(`Error reading packages directory: ${e.message}`);
  process.exit(1);
}

if (packageNames.length === 0) {
  console.log('No packages found in packages/ directory. Exiting.');
  process.exit(0);
}

console.log(
  `\nFound ${packageNames.length} packages. Querying download counts for the period: ${period}...`,
);
console.log('--------------------------------------------------');

/**
 * Fetches download counts for all packages and returns a sorted array.
 * @returns {Promise<Array<{name: string, downloads: number}>>}
 */
async function fetchDownloads() {
  const results = [];
  const totalPackages = packageNames.length;
  let processedCount = 0;

  for (const packageName of packageNames) {
    const url = `https://api.npmjs.org/downloads/point/${period}/${packageName}`;
    try {
      const data = await new Promise((resolve, reject) => {
        https
          .get(url, (res) => {
            let rawData = '';
            res.on('data', (chunk) => {
              rawData += chunk;
            });
            res.on('end', () => {
              try {
                resolve(JSON.parse(rawData));
              } catch (e) {
                reject(e);
              }
            });
          })
          .on('error', (e) => {
            reject(e);
          });
      });

      const downloads = data.downloads || 0;
      results.push({
        name: packageName,
        downloads: downloads,
      });
      processedCount++;
      // Print progress update with package name and downloads
      console.log(
        `[${processedCount}/${totalPackages}] Fetched ${packageName}: ${downloads.toLocaleString()} downloads`,
      );
    } catch (err) {
      processedCount++;
      console.error(
        `[${processedCount}/${totalPackages}] Error fetching downloads for ${packageName}: ${err.message}`,
      );
    }
  }
  // Sort results in descending order by downloads
  results.sort((a, b) => b.downloads - a.downloads);
  return results;
}

/**
 * Prints the download ranking with a simple character-based bar chart.
 * @param {Array<{name: string, downloads: number}>} sortedResults
 */
function printRanking(sortedResults) {
  if (sortedResults.length === 0) {
    console.log('No downloads data to display.');
    return;
  }

  const maxBarLength = 50; // Max length of the bar chart
  const maxDownloads = sortedResults[0].downloads;

  console.log('\n--- NPM Download Ranking ---');
  console.log(`Period: ${period}`);
  console.log('--------------------------------------------------');

  sortedResults.forEach((pkg, index) => {
    const barLength =
      maxDownloads > 0
        ? Math.round((pkg.downloads / maxDownloads) * maxBarLength)
        : 0;
    const bar = '█'.repeat(barLength);
    const rank = index + 1;
    const formattedDownloads = pkg.downloads.toLocaleString();

    console.log(`${rank}. ${pkg.name}: ${formattedDownloads}`);
    console.log(`   [${bar}]`);
  });

  console.log('--------------------------------------------------');
}

// Main execution flow
fetchDownloads().then(printRanking);
