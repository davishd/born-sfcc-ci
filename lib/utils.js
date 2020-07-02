'use strict';

const path = require('path');
const fs = require('fs');
const del = require('del');
const ora = require('ora');

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
    const spinner = ora();
    if (error && error.message && error.message !== 'null') {
        spinner.fail(`${error.message}`);
    } else {
        spinner.fail('An error occured. Verify your dw.json, OCAPI, and WebDAV configurations.');
    }
}

function logImportResults(results) {
    const spinner = ora();
    results.forEach((result) => {
        const importFileParam = result.parameters.find((param) => param.name === 'ImportFile');
        spinner.info(`Imported data: ${importFileParam.value}`);
        spinner.info(`Log URL: https://${result.instance}/on/demandware.servlet/webdav/Sites/Impex/log/${result.log_file_name}\n`);
    });
}

function logImportError(error) {
    const spinner = ora();
    if (error.parameters) {
        const importFileParam = error.parameters.find((param) => param.name === 'ImportFile');
        spinner.fail(`Failed to import data: ${importFileParam.value}`);
        spinner.fail(`Log URL: https://${error.instance}/on/demandware.servlet/webdav/Sites/Impex/log/${error.log_file_name}\n`);
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
    logImportError
};
