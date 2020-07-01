'use strict';

const sfcc = require('sfcc-ci');

function activate(hostname, codeVersion, token) {
    if (!hostname) {
        throw new Error('No hostname was provided. Verify your dw.json.');
    }

    return new Promise((resolve, reject) => {
        sfcc.code.activate(hostname, codeVersion, token, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(codeVersion);
        });
    });
}

module.exports = activate;
