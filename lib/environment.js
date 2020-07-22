'use strict';

const Conf = require('conf');
const fetch = require('node-fetch');
const globals = require('./globals');

/**
 * Retrieve the auth token from local storage.
 * @return {string}
 */
function getAuthToken() {
  const config = new Conf();
  return config.get('AUTH_TOKEN');
}

/**
 * Retrieve information about the authenticated user.
 * @return {object|null}
 */
async function getUser() {
  const url = globals.B2C_API_ENDPOINTS.ME;
  const token = getAuthToken();

  const response = await fetch(url, {
    headers: {authorization: `Bearer ${token}`},
  });
  const json = await response.json();

  if (json.error) {
    return null;
  }

  try {
    const {id, email, name} = json.data.user;
    return {
      id,
      email,
      name,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Set the auth token in local storage.
 * @param {string} token
 */
function setAuthToken(token) {
  const config = new Conf();
  config.set('AUTH_TOKEN', token);
}

module.exports = {
  getAuthToken,
  getUser,
  setAuthToken,
};
