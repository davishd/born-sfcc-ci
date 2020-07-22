'use strict';

const environment = require('./environment');
const fs = require('fs');
const globals = require('./globals');
const http = require('http');
const open = require('open');
const path = require('path');
const url = require('url');
const util = require('util');

/**
 * Serve a HTML page to handle the authentication redirect response.
 * @param {http.ServerResponse} response
 */
function servePage(response) {
  const content = fs.readFileSync(path.join(__dirname, 'auth.html'));

  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(content);
  response.end();
}

/**
 * Handle requests made to the local server created for authentication.
 * @param {http.ServerRequest} request
 * @param {http.ServerResponse} response
 * @param {function} callback
 */
function handleRequest(request, response, callback) {
  const parsed = url.parse(request.url, true);
  const result = {};

  if (!parsed.query.access_token && !parsed.query.error) {
    servePage(response);
  } else if (parsed.query.access_token) {
    result.success = true;
    result.token = parsed.query.access_token;
  } else {
    result.error = true;
  }

  callback(result);
}

/**
 * Create a server runnning on localhost.
 * @return {Promise} Promise object represents that the server is listening.
 */
function createServer() {
  const server = http.createServer();
  const serverOpts = {
    host: 'localhost',
    port: globals.AUTH_PORT,
  };

  return new Promise((resolve, reject) => {
    server.on('error', (error) => reject(error));
    server.listen(serverOpts.port, () => resolve(server));
  });
}

/**
 * Authenticate the user using an implict OAuth flow.
 * @param {string} clientId
 */
async function authenticate(clientId) {
  let token = environment.getAuthToken();
  let user = await environment.getUser();

  if (token && user) {
    return {
      token,
      user,
    };
  }

  const server = await createServer();
  const authRequest = new Promise((resolve, reject) => {
    server.on('request', (request, response) => {
      handleRequest(request, response, (result) => {
        if (result.success) {
          response.end('You may close this tab');
          server.close();
          resolve(result);
        } else if (result.error) {
          reject(result.error);
        }
      });
    });
  });

  const redirectUrl = globals.AUTH_REDIRECT_URL;
  const responseType = 'token';
  const authUrl =
      util.format(globals.AM_AUTH_URL, clientId, redirectUrl, responseType);
  open(authUrl);

  const authResult = await authRequest;
  token = authResult.token;
  environment.setAuthToken(token);
  user = await environment.getUser();

  return {
    token,
    user,
  };
}

module.exports = authenticate;
