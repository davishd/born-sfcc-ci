'use strict';

const ora = require('ora');

const utils = require('../lib/utils');
const authenticate = require('../lib/authenticate');
const compress = require('../lib/data-compress');
const dataUpload = require('../lib/data-upload');
const dataImport = require('../lib/data-import');

module.exports = async () => {
    const spinner = ora();
    let dw = {};
    let hostnames = [];
    let compressedFolders = [];
    let token = '';

    try {
        dw = utils.getDw();
        hostnames = dw['data-hostnames'] || dw.hostname;

        spinner.start('Authenticating');
        const result = await authenticate(dw['client-id'], dw['client-secret']);
        const { user } = result;
        token = result.token;
        spinner.succeed(`Authenticated as ${user.name} <${user.email}>`);

        spinner.start('Compressing Data');
        const bundles = utils.getBundles();
        const targetBundle = dw['data-bundle'];
        const folders = bundles[targetBundle];
        compressedFolders = await compress(folders);
        spinner.succeed('Data Compressed');

        spinner.start('Uploading Data');
        await dataUpload(hostnames, compressedFolders, token);
        spinner.succeed('Data Uploaded');
    } catch (error) {
        spinner.fail();
        utils.logError(error);
        utils.deleteTempDirectory();
        return;
    }

    try {
        spinner.start('Importing Data');
        const results = await dataImport(hostnames, compressedFolders, token);
        spinner.succeed('Data Imported\n');
        utils.logImportResults(results);
    } catch (error) {
        spinner.fail();
        utils.logImportError(error);
    } finally {
        utils.deleteTempDirectory();
    }
};
