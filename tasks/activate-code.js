'use strict';

const activate = require('../lib/code-activate');
const authenticate = require('../lib/authenticate');
const logger = require('../lib/logger');
const utils = require('../lib/utils');

/**
 * Activates a code version on the specified instance.
 */
async function activateCode() {
  try {
    const dw = utils.getDw();
    logger.start('Authenticating');
    const {user, token} = await authenticate(dw['client-id']);
    logger.success(`Authenticated as ${user.name} <${user.email}>`);

    logger.start(`Activating code version ${dw['code-version']}`);
    const version = await activate(dw.hostname, dw['code-version'], token);
    logger.success(`Activated code version ${version} on ${dw.hostname}`);
  } catch (error) {
    logger.error();
    utils.logError(error);
  }
}

module.exports = activateCode;
