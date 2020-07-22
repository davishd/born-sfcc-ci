'use strict';

const authenticate = require('../lib/authenticate');
const compress = require('../lib/data-compress');
const dataDelete = require('../lib/data-delete');
const dataImport = require('../lib/data-import');
const dataUpload = require('../lib/data-upload');
const logger = require('../lib/logger');
const utils = require('../lib/utils');

module.exports = async () => {
    let dw = {};
    let hostnames = [];
    let compressedFolders = [];
    let token = '';

    try {
        dw = utils.getDw();
        hostnames = dw['data-hostnames'] || dw.hostname;

        logger.start('Authenticating');
        const result = await authenticate(dw['client-id'], dw['client-secret']);
        const { user } = result;
        token = result.token;
        logger.success(`Authenticated as ${user.name} <${user.email}>`);

        const folders = await utils.getDataFolders();

        logger.start('Compressing data');
        compressedFolders = await compress(folders);
        logger.success('Data compressed');

        logger.start('Uploading data');
        await dataUpload(hostnames, compressedFolders, token);
        logger.success('Data uploaded');
    } catch (error) {
        logger.error();
        utils.logError(error);
        utils.deleteTempDirectory();
        return;
    }

    try {
        logger.start('Importing data');
        const results = await dataImport(hostnames, compressedFolders, token);
        logger.success('Data imported\n');
        utils.logImportResults(results);

        logger.start('Deleting uploaded data');
        await dataDelete(hostnames, compressedFolders, token);
        logger.success('Deleted uploaded data\n');
    } catch (error) {
        logger.error();
        utils.logImportError(error);
    } finally {
        utils.deleteTempDirectory();
    }
};
