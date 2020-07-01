'use strict';

const path = require('path');
const sfcc = require('sfcc-ci');

async function importFolder(hostname, folder, token) {
    const job = await new Promise((resolve, reject) => {
        sfcc.instance.import(hostname, path.basename(folder), token, (error, result) => {
            if (typeof (error) !== 'undefined') {
                reject(error);
                return;
            }
            resolve(result);
        });
    });

    const jobResult = await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            sfcc.job.status(hostname, job.job_id, job.id, token, (error, result) => {
                result.instance = hostname;
                if (typeof (error) !== 'undefined' || result.status === 'ERROR') {
                    reject(result);
                    clearInterval(interval);
                }

                if (result.status === 'OK') {
                    resolve(result);
                    clearInterval(interval);
                }
            });
        }, 2000);
    });

    return jobResult;
}

async function dataImport(hostname, folders, token) {
    if (!hostname) {
        throw new Error('No hostname was provided. Verify your dw.json.');
    }

    if (!folders || folders.length === 0) {
        throw new Error('No compressed data folders were provided. Verify your dw.json and config.json configurations.');
    }

    const results = [];
    for (const folder of folders) {
        const result = await importFolder(hostname, folder, token);
        results.push(result);
    }
    return results;
}

module.exports = dataImport;