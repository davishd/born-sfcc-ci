'use strict';

const path = require('path');
const sfcc = require('sfcc-ci');

async function importFile(instance, file, token) {
    const job = await new Promise((resolve, reject) => {
        sfcc.instance.import(instance, path.basename(file), token, (error, result) => {
            if (typeof (error) !== 'undefined') {
                reject(error);
                return;
            }
            resolve(result);
        });
    });

    const jobResult = await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            sfcc.job.status(instance, job.job_id, job.id, token, (error, result) => {
                result.instance = instance;
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

async function dataImport(instance, files, token) {
    const results = [];
    for (const file of files) {
        const result = await importFile(instance, file, token);
        results.push(result);
    }
    return results;
}

module.exports = dataImport;
