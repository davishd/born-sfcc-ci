'use strict';

const sfccAuth = require('sfcc-ci').auth;

function authenticate(id, secret) {
    return new Promise((resolve, reject) => {
        sfccAuth.auth(id, secret, (err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}

module.exports = authenticate;
