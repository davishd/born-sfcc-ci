'use strict';

const sfccInstance = require('sfcc-ci').instance;

function upload(instance, folder, token) {
    return new Promise((resolve, reject) => {
        sfccInstance.upload(instance, folder, token, { }, (result) => {
            if (typeof (result) !== 'undefined') {
                return reject(result);
            }
            return resolve(true);
        });
    });
}

function dataUpload(hostname, folders, token) {
    if (!hostname) {
        throw new Error('No hostname was provided. Verify your dw.json.');
    }
    if (!folders || folders.length === 0) {
        throw new Error('No compressed data folders were provided. Verify your dw.json and config.json configurations.');
    }

    return Promise.all(folders.map((folder) => upload(hostname, folder, token)));
}

module.exports = dataUpload;
