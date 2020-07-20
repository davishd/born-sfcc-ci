'use strict';

const sfccInstance = require('sfcc-ci').instance;

function uploadFolder(instance, folder, token) {
    return new Promise((resolve, reject) => {
        sfccInstance.upload(instance, folder, token, { }, (result) => {
            if (typeof (result) !== 'undefined') {
                return reject(result);
            }

            return resolve(true);
        });
    });
}

function uploadFolders(instance, folders, token) {
    return Promise.all(folders.map((folder) => uploadFolder(instance, folder, token)));
}

function dataUpload(hostnames, folders, token) {
    if (!hostnames) {
        throw new Error('No hostname was provided. Verify your dw.json.');
    }
    if (!folders || folders.length === 0) {
        throw new Error('No compressed data folders were provided. Verify your dw.json and config.json configurations.');
    }

    if (!Array.isArray(hostnames)) {
        // eslint-disable-next-line no-param-reassign
        hostnames = [hostnames];
    }

    return Promise.all(hostnames.map((hostname) => uploadFolders(hostname, folders, token)));
}

module.exports = dataUpload;
