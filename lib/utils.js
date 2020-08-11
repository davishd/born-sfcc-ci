'use strict';

const del = require('del');
const fs = require('fs');
const logger = require('./logger');
const path = require('path');
const xml2js = require('xml2js');


/**
 * Create a temporary directory.
 */
function createTempDirectory() {
  const tempDirectory = path.join(process.cwd(), 'site_data', 'temp');

  if (fs.existsSync(tempDirectory)) {
    del.sync(tempDirectory);
    fs.mkdirSync(tempDirectory);
  } else {
    fs.mkdirSync(tempDirectory);
  }
}

/**
 * Delete a temporary directory.
 */
function deleteTempDirectory() {
  const tempDirectory = path.join(process.cwd(), 'site_data', 'temp');

  if (fs.existsSync(tempDirectory)) {
    del.sync(tempDirectory);
  }
}

/**
 * Retrieve the config.json data bundles and data deployment configuration file.
 * @return {object}
 */
function getDataBundlesConfig() {
  try {
    const config =
        require(path.join(process.cwd(), 'site_data', 'config.json'));

    return config;
  } catch (error) {
    throw new Error(
        'Please check that a valid config.json exists in the site_data' +
        'directory.',
    );
  }
}

/**
 * Retrieve the data directories' paths.
 * In addition to the data directories that are defined explicitly, required
 *     cartridge data directories are identified and added.
 * @return {Array.<string>}
 */
async function getDataDirectories() {
  const dataBundlesConfig = getDataBundlesConfig();
  const bundles = getBundles();
  const dw = getDw();
  const targetBundle = dw['data-bundle'];
  const directories = bundles[targetBundle];

  if (!directories || directories.length === 0) {
    throw new Error(
        'No directories to compress were provided. Verify your dw.json and' +
        'config.json configurations.',
    );
  }

  if (!dataBundlesConfig.cartridges) {
    return directories;
  }

  const cartridges = await getUniqueCartridges();
  const cartridgeDirectories = [];

  directories.forEach((directory) => {
    const directoryPath = directory.split(path.sep);
    const type = directoryPath[directoryPath.length - 1];
    const dataCartridges = cartridges.filter((cartridge) => {
      const cartridgeDirectoryPath =
          path.join(process.cwd(), 'site_data', 'cartridges', cartridge, type);

      return fs.existsSync(cartridgeDirectoryPath);
    });

    const cartridgeDirectoryPaths =
        dataCartridges.map((cartridge) => path.join(cartridge, type));

    cartridgeDirectories.push(...cartridgeDirectoryPaths);
  });

  directories.push(...cartridgeDirectories);

  return directories;
}

/**
 * Retrieve the dw.json configuration.
 * @return {object}
 */
function getDw() {
  try {
    return require(path.join(process.cwd(), 'dw.json'));
  } catch (error) {
    throw new Error(
        'Please check that a valid dw.json exists in the root' +
        'directory of the project.',
    );
  }
}

/**
 * Retrieve the data "bundles" configuration.
 * @return {object}
 */
function getBundles() {
  try {
    const config =
        require(path.join(process.cwd(), 'site_data', 'config.json'));

    return config.bundles;
  } catch (error) {
    throw new Error(
        'Please check that a valid config.json exists in the site_data' +
        'directory.',
    );
  }
}

/**
 * Retrieve the unique cartridges between the defined sites
 * @return {Array.<string>}
 */
async function getUniqueCartridges() {
  const sitesDirectory =
      path.join(process.cwd(), 'site_data', 'common', 'sites');
  const sites =
      fs.readdirSync(sitesDirectory, {withFileTypes: true}).
          filter((dirent) => dirent.isDirectory());

  const cartridgeSet = new Set();

  for (const site of sites) {
    const siteXmlPath = path.join(sitesDirectory, site.name, 'site.xml');
    const siteXmlFile = fs.readFileSync(siteXmlPath);
    const parsedSiteFile = await xml2js.parseStringPromise(siteXmlFile);
    const cartridges = parsedSiteFile.site['custom-cartridges'][0].split(':');
    for (const cartridge of cartridges) {
      cartridgeSet.add(cartridge);
    }
  }

  return Array.from(cartridgeSet.values());
}

/**
 * Log a general exception
 * @param {Error} error
 */
function logError(error) {
  if (error && error.message && error.message !== 'null') {
    logger.error(`${error.message}`);
  } else {
    logger.error('An error occured. Verify your dw.json, OCAPI, and WebDAV' +
        'configurations.');
  }
}

/**
 * Log data import results
 * @param {Array.<Object>} instanceImportResults
 */
function logImportResults(instanceImportResults) {
  instanceImportResults.forEach((instanceImportResult) => {
    instanceImportResult.forEach((importResult) => {
      const importFileParam =
          importResult.parameters.
              find((param) => param.name === 'ImportFile');

      logger.info(`Imported data: ${importFileParam.value}`);
      logger.info(`Log URL: https://${importResult.instance}/on/` +
          `demandware.servlet/webdav/Sites/Impex/log/` +
          `${importResult.log_file_name}\n`);
    });
  });
}

/**
 * Log a data import error
 * @param {Object} error
 */
function logImportError(error) {
  if (error.parameters) {
    const importFileParam =
        error.parameters.find((param) => param.name === 'ImportFile');

    logger.error(`Failed to import data: ${importFileParam.value}`);
    logger.error(`Log URL: https://${error.instance}/on/demandware.servlet/` +
        `webdav/Sites/Impex/log/${error.log_file_name}\n`);
  } else {
    logError(error);
  }
}

module.exports = {
  createTempDirectory,
  deleteTempDirectory,
  getDataDirectories,
  getDw,
  getBundles,
  getUniqueCartridges,
  logError,
  logImportResults,
  logImportError,
};
