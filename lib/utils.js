'use strict';

const path = require('path');
const fs = require('fs');
const del = require('del');

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
    getDw,
    getBundles,
    logError,
    logImportResults,
    logImportError,
};
