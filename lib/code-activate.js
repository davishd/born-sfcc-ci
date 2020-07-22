'use strict';

const sfcc = require('sfcc-ci');

/**
 * Activate the code version.
 * @param {string} instance
 * @param {string} codeVersion
 * @param {string} token
 * @return {Promise} The promise object represents the code version that
 *     was activated.
 */
function activate(instance, codeVersion, token) {
  if (!instance) {
    throw new Error('No hostname was provided. Verify your dw.json.');
  }

  return new Promise((resolve, reject) => {
    sfcc.code.activate(instance, codeVersion, token, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(codeVersion);
    });
  });
}

module.exports = activate;
