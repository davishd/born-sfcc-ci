'use strict';

const AM_AUTH_PATH = '/dwsso/oauth2/authorize?client_id=%s&redirect_uri=%s&response_type=%s';
const AM_HOST = 'account.demandware.com';
const AM_AUTH_URL = `https://${AM_HOST}${AM_AUTH_PATH}`;
const AM_TOKEN_PATH = '/dw/oauth2/access_token';
const AUTH_PORT = 8080;
const AUTH_REDIRECT_URL = `http://localhost:${AUTH_PORT}`;
const B2C_API_HOST = 'admin.us01.dx.commercecloud.salesforce.com';
const B2C_API_PATH = '/api/v1';
const B2C_API_URL = `https://${B2C_API_HOST}${B2C_API_PATH}`;
const B2C_API_ENDPOINTS = {
    ME: `${B2C_API_URL}/me`
};

module.exports = {
    AM_AUTH_PATH,
    AM_HOST,
    AM_AUTH_URL,
    AM_TOKEN_PATH,
    AUTH_PORT,
    AUTH_REDIRECT_URL,
    B2C_API_HOST,
    B2C_API_PATH,
    B2C_API_URL,
    B2C_API_ENDPOINTS
};
