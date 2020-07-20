'use strict';

const fs = require('fs');
const http = require('http');
const open = require('open');
const path = require('path');
const url = require('url');
const util = require('util');

const environment = require('./environment');
const globals = require('./globals');

function servePage(response) {
    const content = fs.readFileSync(path.join(__dirname, 'auth.html'));

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(content);
    response.end();
}

function handleRequest(request, response, cb) {
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

    cb(result);
}

function createServer() {
    const server = http.createServer();
    const serverOpts = {
        host: 'localhost',
        port: globals.AUTH_PORT,
    };

    return new Promise((resolve) => {
        server.listen(serverOpts.port, () => {
            resolve(server);
        });
    });
}

async function authenticate(clientId) {
    let token = environment.getAuthToken();
    let user = await environment.getUser();

    if (token && user) {
        return {
            token,
            user
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
                    reject();
                }
            });
        });
    });

    const redirectUrl = globals.AUTH_REDIRECT_URL;
    const responseType = 'token';
    const authUrl = util.format(globals.AM_AUTH_URL, clientId, redirectUrl, responseType);
    open(authUrl);

    const authResult = await authRequest;
    token = authResult.token;
    environment.setAuthToken(token);
    user = await environment.getUser();

    return {
        token,
        user
    };
}

module.exports = authenticate;
