'use strict';

const fetch = require('node-fetch');
const path = require('path');

const globals = require('./globals');

async function deleteFolder(instance, folder, token) {
    const url = `https://${instance}${globals.WEBDAV_SRC_PATH}/${path.basename(folder)}`;

    await fetch(url, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
    });
}

function deleteFolders(instance, folders, token) {
    return Promise.all(folders.map((folder) => deleteFolder(instance, folder, token)));
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

    return Promise.all(hostnames.map((hostname) => deleteFolders(hostname, folders, token)));
}

module.exports = dataUpload;
