'use strict';

const fetch = require('node-fetch');
const globals = require('./globals');
const path = require('path');

/**
 * Delete a data archive on an instance.
 * @param {string} instance
 * @param {string} archive
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the result of the
 *     the deletion.
 */
async function deleteArchive(instance, archive, token) {
  const url = `https://${instance}${globals.WEBDAV_SRC_PATH}/ ` +
      `${path.basename(archive)}`;

  try {
    await fetch(url, {
      method: 'DELETE',
      headers: {authorization: `Bearer ${token}`},
    });
  } catch (error) {
    return error;
  }
}

/**
 * Delete data archives on an instance.
 * @param {string} instance
 * @param {Array.<string>} archives
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the result of the
 *     the deletions.
 */
function deleteArchives(instance, archives, token) {
  return Promise.all(
      archives.map((archive) =>
        deleteArchive(instance, archive, token)),
  );
}

/**
 * Delete data archives on instances.
 * @param {string} instances
 * @param {Array.<string>} archives
 * @param {string} token
 * @return {Array.<Promise>} The promise object represents the result of the
 *     the deletions.
 */
function dataDelete(instances, archives, token) {
  if (!instances) {
    throw new Error('No hostname was provided. Verify your dw.json.');
  }
  if (!archives || archives.length === 0) {
    throw new Error(
        'No archives to delete were identified. Verify your dw.json and' +
        'config.json configurations.',
    );
  }

  if (!Array.isArray(instances)) {
    instances = [instances];
  }

  return Promise.all(
      instances.map((instance) =>
        deleteArchives(instance, archives, token)),
  );
}

module.exports = dataDelete;
