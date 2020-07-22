'use strict';

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');

/**
 * Retrieve the full path to the data directory.
 * @param {string} directory
 * @return {string}
 */
function getSrcDirectoryPath(directory) {
  const directoryPath = directory.split(path.sep);
  const siteDataDirectoryPath =
        path.join(process.cwd(), 'site_data', ...directoryPath);

  if (fs.existsSync(siteDataDirectoryPath)) {
    return siteDataDirectoryPath;
  }

  const siteDataCartridgeDirectoryPath =
        path.join(process.cwd(), 'site_data', 'cartridges', ...directoryPath);
  return siteDataCartridgeDirectoryPath;
}

/**
 * Compress a data directory.
 * @param {string} directory
 * @return {Array.<Promise>} The promise object represents the path to the
 *     compressed directory.
 */
function compress(directory) {
  return new Promise((resolve, reject) => {
    const src = getSrcDirectoryPath(directory);
    const directoryName = directory.replace(/\//g, '_');
    const temp = path.join(process.cwd(), 'site_data', 'temp');
    const target = path.join(temp, `${directoryName}.zip`);

    if (!fs.existsSync(src)) {
      reject(new Error(`Data directory ${src} does not exist.`));
    }
    if (!fs.existsSync(temp)) {
      reject(new Error(`Temporary directory ${temp} does not exist.`));
    }
    const writeStream = fs.createWriteStream(target);
    const archive = archiver('zip', {zlib: {level: 9}});

    archive.on('warning', (err) => reject(err));
    archive.on('error', (err) => reject(err));
    writeStream.on('close', () => resolve(target));

    archive.pipe(writeStream);
    archive.directory(src, directoryName);
    archive.finalize();
  });
}

/**
 * Compress data directories.
 * @param {Array.<string>} directories
 * @return {Array.<Promise>} The promise object represents the path to the
 *     compressed directories.
 */
function dataCompress(directories) {
  if (!directories || directories.length === 0) {
    throw new Error(
        'No directories to compress were provided. Verify your dw.json and' +
        'config.json configurations.',
    );
  }

  utils.createTempDirectory();

  return Promise.all(directories.map((directory) => compress(directory)));
}

module.exports = dataCompress;
