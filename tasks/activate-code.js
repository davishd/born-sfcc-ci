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

    const codeVersion = dw['version'] || dw['code-version'];
    logger.start(`Activating code version ${codeVersion}`);
    await activate(dw.hostname, codeVersion, token);
    logger.success(`Activated code version ${codeVersion} on ${dw.hostname}`);
  } catch (error) {
    logger.error();
    utils.logError(error);
  }
}

module.exports = activateCode;
