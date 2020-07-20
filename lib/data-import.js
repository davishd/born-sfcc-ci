'use strict';

const path = require('path');
const sfcc = require('sfcc-ci');

async function importFolder(hostname, folder, token) {
    const job = await new Promise((resolve, reject) => {
        sfcc.instance.import(hostname, path.basename(folder), token, (error, result) => {
            if (typeof (error) !== 'undefined') {
                return reject(error);
            }

            return resolve(result);
        });
    });

    const jobResult = await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            sfcc.job.status(hostname, job.job_id, job.id, token, (error, result) => {
                // eslint-disable-next-line no-param-reassign
                result.instance = hostname;

                if (typeof (error) !== 'undefined' || result.status === 'ERROR') {
                    clearInterval(interval);
                    reject(result);
                }

                if (result.status === 'OK') {
                    clearInterval(interval);
                    resolve(result);
                }
            });
        }, 2000);
    });

    return jobResult;
}

async function importFolders(hostname, folders, token) {
    const results = [];

    for (const folder of folders) {
        const result = await importFolder(hostname, folder, token);
        results.push(result);
    }

    return results;
}

async function dataImport(hostnames, folders, token) {
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

    return Promise.all(hostnames.map((hostname) => importFolders(hostname, folders, token)));
}

module.exports = dataImport;
