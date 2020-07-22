'use strict';

const sfccInstance = require('sfcc-ci').instance;

/**
 * Upload an archive to an instance.
 * @param {string} instance
 * @param {string} archive
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the results of the
 *     upload.
 */
function uploadArchive(instance, archive, token) {
  return new Promise((resolve, reject) => {
    sfccInstance.upload(instance, archive, token, {}, (result) => {
      if (typeof (result) !== 'undefined') {
        return reject(result);
      }

      return resolve(true);
    });
  });
}

/**
 * Upload archives to an instance.
 * @param {string} instance
 * @param {Array.<string>} archives
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the results of the
 *     uploads.
 */
function uploadArchives(instance, archives, token) {
  return Promise.all(
      archives.map((archive) => uploadArchive(instance, archive, token)),
  );
}

/**
 * Upload archives to instances.
 * @param {Array.<string>} instances
 * @param {Array.<string>} archives
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the results of the
 *     uploads.
 */
function dataUpload(instances, archives, token) {
  if (!instances) {
    throw new Error('No hostname was provided. Verify your dw.json.');
  }
  if (!archives || archives.length === 0) {
    throw new Error(
        'No archives to upload were identified. Verify your dw.json and' +
        'config.json configurations.',
    );
  }

  if (!Array.isArray(instances)) {
    instances = [instances];
  }

  return Promise.all(
      instances.map((instance) => uploadArchives(instance, archives, token)),
  );
}

module.exports = dataUpload;
