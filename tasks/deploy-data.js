'use strict';

const ora = require('ora');
const utils = require('../lib/utils');
const authenticate = require('../lib/authenticate');
const compress = require('../lib/data-compress');
const dataUpload = require('../lib/data-upload');
const dataImport = require('../lib/data-import');

module.exports = async () => {
    const spinner = ora();
    const dw = utils.getDw();

    spinner.start('Authenticating');
    const token = await authenticate(dw['client-id'], dw['client-secret']);
    spinner.succeed('Authenticated');

    spinner.start('Compressing Data');
    const bundles = utils.getBundles();
    const targetBundle = dw['data-bundle'];
    const folders = bundles[targetBundle];
    const compressedFiles = await compress(folders);
    spinner.succeed('Data Compressed');

    spinner.start('Uploading Data');
    await dataUpload(dw.hostname, compressedFiles, token);
    spinner.succeed('Data Uploaded');

    try {
        spinner.start('Importing Data');
        const results = await dataImport(dw.hostname, compressedFiles, token);
        spinner.succeed('Data Imported\n');
        utils.logImportResults(results);
    } catch (error) {
        spinner.stop();
        if (error) {
            utils.logImportError(error);
        }
    }

    utils.deleteTempDirectory();
};
