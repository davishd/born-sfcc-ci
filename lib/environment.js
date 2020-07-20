'use strict';

const Conf = require('conf');
const fetch = require('node-fetch');

const globals = require('./globals');

function getAuthToken() {
    const config = new Conf();
    return config.get('AUTH_TOKEN');
}

async function getUser() {
    const url = globals.B2C_API_ENDPOINTS.ME;
    const token = getAuthToken();

    const response = await fetch(url, {
        headers: { authorization: `Bearer ${token}` }
    });
    const json = await response.json();

    if (json.error) {
        return null;
    }

    try {
        const { id, email, name } = json.data.user;
        return {
            id,
            email,
            name
        };
    } catch (error) {
        return null;
    }
}

function setAuthToken(token) {
    const config = new Conf();
    config.set('AUTH_TOKEN', token);
}

module.exports = {
    getAuthToken,
    getUser,
    setAuthToken
};
