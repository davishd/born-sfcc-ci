'use strict';

const ora = require('ora');
const utils = require('../lib/utils');
const authenticate = require('../lib/authenticate');
const activate = require('../lib/code-activate');

module.exports = async () => {
    const spinner = ora();

    try {
        const dw = utils.getDw();

        spinner.start('Authenticating');
        const token = await authenticate(dw['client-id'], dw['client-secret']);
        spinner.succeed('Authenticated');

        spinner.start(`Activating code version ${dw['code-version']}`);
        const version = await activate(dw.hostname, dw['code-version'], token);
        spinner.succeed(`Activated code version ${version}`);
    } catch (error) {
        spinner.fail();
        utils.logError(error);
    }
};
