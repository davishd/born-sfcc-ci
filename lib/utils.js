'use strict';

const del = require('del');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const logger = require('./logger');

function createTempDirectory() {
    const tempDirectory = path.join(process.cwd(), 'site_data', 'temp');

    if (fs.existsSync(tempDirectory)) {
        del.sync(tempDirectory);
        fs.mkdirSync(tempDirectory);
    } else {
        fs.mkdirSync(tempDirectory);
    }
}

function deleteTempDirectory() {
    const tempDirectory = path.join(process.cwd(), 'site_data', 'temp');

    if (fs.existsSync(tempDirectory)) {
        del.sync(tempDirectory);
    }
}

async function getDataFolders() {
    const bundles = getBundles();
    const dw = getDw();
    const targetBundle = dw['data-bundle'];
    const folders = bundles[targetBundle];

    if (!folders || folders.length === 0) {
        throw new Error('No folders to compress were provided. Verify your dw.json and config.json configurations.');
    }
    const cartridges = await getUniqueCartridges();
    const cartridgeFolders = [];

    folders.forEach((folder) => {
        const folderPath = folder.split(path.sep);
        const folderType = folderPath[folderPath.length - 1];
        const dataCartridges = cartridges.filter((cartridge) => {
            const cartridgeFolderPath = path.join(process.cwd(), 'site_data', 'cartridges', cartridge, folderType);
            return fs.existsSync(cartridgeFolderPath);
        });
        const cartridgeFolderPaths = dataCartridges.map((cartridge) => path.join(cartridge, folderType));
        cartridgeFolders.push(...cartridgeFolderPaths);
    });

    folders.push(...cartridgeFolders);

    return folders;
}

function getDw() {
    try {
        return require(path.join(process.cwd(), 'dw.json'));
    } catch (error) {
        throw new Error('Please check that a valid dw.json exists in the root directory.');
    }
}

function getBundles() {
    try {
        const config = require(path.join(process.cwd(), 'site_data', 'config.json'));
        return config.bundles;
    } catch (error) {
        throw new Error('Please check that a valid config.json exists in the site_data directory.');
    }
}

async function getUniqueCartridges() {
    const sitesDirectory = path.join(process.cwd(), 'site_data', 'common', 'sites');
    const sites = fs.readdirSync(sitesDirectory, { withFileTypes: true }).filter((folder) => folder.isDirectory());
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

function logError(error) {
    if (error && error.message && error.message !== 'null') {
        logger.error(`${error.message}`);
    } else {
        logger.error('An error occured. Verify your dw.json, OCAPI, and WebDAV configurations.');
    }
}

function logImportResults(instanceImportResults) {
    instanceImportResults.forEach((instanceImportResult) => {
        instanceImportResult.forEach((folderImportResult) => {
            const importFileParam = folderImportResult.parameters.find((param) => param.name === 'ImportFile');
            logger.info(`Imported data: ${importFileParam.value}`);
            logger.info(`Log URL: https://${folderImportResult.instance}/on/demandware.servlet/webdav/Sites/Impex/log/${folderImportResult.log_file_name}\n`);
        });
    });
}

function logImportError(error) {
    if (error.parameters) {
        const importFileParam = error.parameters.find((param) => param.name === 'ImportFile');
        logger.error(`Failed to import data: ${importFileParam.value}`);
        logger.error(`Log URL: https://${error.instance}/on/demandware.servlet/webdav/Sites/Impex/log/${error.log_file_name}\n`);
    } else {
        logError(error);
    }
}

module.exports = {
    createTempDirectory,
    deleteTempDirectory,
    getDataFolders,
    getDw,
    getBundles,
    getUniqueCartridges,
    logError,
    logImportResults,
    logImportError,
};
