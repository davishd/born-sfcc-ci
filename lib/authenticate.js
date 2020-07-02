'use strict';

const sfccAuth = require('sfcc-ci').auth;

function authenticate(id, secret) {
    return new Promise((resolve, reject) => {
        sfccAuth.auth(id, secret, (err, token) => {
            if (err) {
                return reject(err);
            }
            return resolve(token);
        });
    });
}

module.exports = authenticate;
