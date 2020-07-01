'use strict';

const sfcc = require('sfcc-ci');

function activate(instance, codeVersion, token) {
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
