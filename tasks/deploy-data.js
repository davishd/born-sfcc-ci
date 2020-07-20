'use strict';

const ora = require('ora');

const authenticate = require('../lib/authenticate');
const compress = require('../lib/data-compress');
const dataDelete = require('../lib/data-delete');
const dataImport = require('../lib/data-import');
const dataUpload = require('../lib/data-upload');
const utils = require('../lib/utils');

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

        spinner.start('Compressing data');
        const bundles = utils.getBundles();
        const targetBundle = dw['data-bundle'];
        const folders = bundles[targetBundle];
        compressedFolders = await compress(folders);
        spinner.succeed('Data compressed');

        spinner.start('Uploading data');
        await dataUpload(hostnames, compressedFolders, token);
        spinner.succeed('Data uploaded');
    } catch (error) {
        spinner.fail();
        utils.logError(error);
        utils.deleteTempDirectory();
        return;
    }

    try {
        spinner.start('Importing data');
        const results = await dataImport(hostnames, compressedFolders, token);
        spinner.succeed('Data imported\n');
        utils.logImportResults(results);

        spinner.start('Deleting uploaded data');
        await dataDelete(hostnames, compressedFolders, token);
        spinner.succeed('Deleted uploaded data\n');
    } catch (error) {
        spinner.fail();
        utils.logImportError(error);
    } finally {
        utils.deleteTempDirectory();
    }
};
