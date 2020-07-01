'use strict';

const sfccInstance = require('sfcc-ci').instance;

function upload(instance, folder, token) {
    return new Promise((resolve, reject) => {
        sfccInstance.upload(instance, folder, token, { }, (result) => {
            if (typeof (result) !== 'undefined') {
                reject(result);
                return;
            }
            resolve(true);
        });
    });
}

function dataUpload(hostname, folders, token) {
    return Promise.all(folders.map((folder) => upload(hostname, folder, token)));
}

module.exports = dataUpload;
