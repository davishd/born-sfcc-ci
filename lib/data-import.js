'use strict';

const path = require('path');
const sfcc = require('sfcc-ci');

/**
 * Import a single data archive on an instance.
 * @param {string} instance
 * @param {string} archive
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the result of the
 *     import job.
 */
async function importArchive(instance, archive, token) {
  const job = await new Promise((resolve, reject) => {
    sfcc.instance.
        import(instance, path.basename(archive), token, (error, result) => {
          if (typeof (error) !== 'undefined') {
            return reject(error);
          }

          return resolve(result);
        });
  });

  const jobResult = await new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      sfcc.job.status(instance, job.job_id, job.id, token, (error, result) => {
        result.instance = instance;

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

/**
 * Import compressed data archives on an instance.
 * @param {string} instance
 * @param {Array.<string>} archives
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the results of the
 *     import jobs.
 */
async function importArchives(instance, archives, token) {
  const results = [];

  for (const archive of archives) {
    const result = await importArchive(instance, archive, token);
    results.push(result);
  }

  return results;
}

/**
 * Import compressed data archives on instances.
 * @param {Array.<string>} instances
 * @param {Array.<string>} archives
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the results of the
 *     import jobs.
 */
async function dataImport(instances, archives, token) {
  if (!instances) {
    throw new Error('No hostname was provided. Verify your dw.json.');
  }
  if (!archives || archives.length === 0) {
    throw new Error(
        'No archives to import were provided. Verify your dw.json and' +
        'config.json configurations.',
    );
  }

  if (!Array.isArray(instances)) {
    instances = [instances];
  }

  return Promise.all(
      instances.map((instance) => importArchives(instance, archives, token)),
  );
}

module.exports = dataImport;
