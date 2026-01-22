'use strict';

// #############################################################################

const http = require('http');
const https = require('https');
const url = require('url');

/**
 * Handles response from request and prints out response status, headers, body
 * @param {Object} response
 * @param {Number} logLevel must be an integer: 0 or 1 or 2
 * @param {Function} callbackFunction
 */
function _handleResponse (response, logLevel, callbackFunction) {
    const spacesToIndent = 4;

    let data = '';

    if (logLevel === 1 || logLevel === 2) {
        console.log(`\n-> Response status: ${response.statusCode}`);

        if (response.headers && logLevel === 2) {
            console.log(`\n-> Response headers: ${JSON.stringify(response.headers, null, spacesToIndent)}`);
        }
    }

    response.setEncoding('utf8');

    response.on('data', (chunk) => {
        // Accumulate all data from response
        data += chunk;
    });
    response.on('end', () => {
        let res = data.length > 0 ? data : 'empty';

        if (logLevel === 1 || logLevel === 2) {
            console.log(`\n-> Response body: ${res}`);
        }
        // Resolve after response was finished and all data from response was accumulated
        callbackFunction(data);
    });
}

/**
 * Sends request
 * @param {String} method GET or POST or DELETE or any other
 * @param {String} requestUrl URL to send request to
 * @param {String} headersString string that contains request headers
 * @param {String} bodyString string that contains request body
 * @param {Number} logLevel must be an integer: 0 or 1 or 2, defaults to 0 (no logs)
 * @returns {Promise} response
 */
function sendRequest (
    method = '',
    requestUrl = '',
    headersString = '',
    bodyString = '',
    logLevel = 0
) {
    if (typeof arguments[0] === 'object') {
        /* eslint-disable no-param-reassign */
        method = arguments[0].method || '';
        requestUrl = arguments[0].requestUrl || '';
        headersString = arguments[0].headersString || '';
        bodyString = arguments[0].bodyString || '';
        logLevel = arguments[0].logLevel || 0;
        /* eslint-enable no-param-reassign */
    }

    if (method.length === 0) {
        console.log('\n-> Problem with request method - please specify it ' +
            'as a string (for example: \'GET\' or \'POST\' or \'DELETE\' or ' +
            'any other)');
    }
    if (requestUrl.length === 0) {
        console.log('\n-> Problem with request URL - please specify it as a ' +
            'string (for example: \'https://www.google.com/\')');
    }

    return new Promise((resolve, reject) => {
        // Check incoming body string to have proper JSON inside of it
        const requestBody = bodyString.length > 0 ? JSON.stringify(JSON.parse(bodyString)) : '';
        const contentType = method.toUpperCase() === 'GET' ? 'text/html' : 'application/json';

        // Check incoming headers string to have proper JSON inside of it
        const requestHeaders = headersString.length > 0 ?
            JSON.parse(headersString) :
            {
                'Content-Type': contentType,
                'Connection': 'close',
                'Content-Length': Buffer.byteLength(requestBody)
            };

        const parsedUrl = new url.URL(requestUrl);
        const options = {
            protocol: parsedUrl.protocol,
            auth: parsedUrl.username ? `${parsedUrl.username}:${parsedUrl.password}` : '',
            hostname: parsedUrl.hostname,
            path: parsedUrl.search ? `${parsedUrl.pathname}${parsedUrl.search}` : parsedUrl.pathname,
            hash: parsedUrl.hash,
            port: parsedUrl.port,
            method: method,
            headers: requestHeaders
        };

        let req;

        if (requestUrl.includes('https')) {
            req = https.request(options, (res) => {
                _handleResponse(res, logLevel, resolve);
            });
        } else {
            req = http.request(options, (res) => {
                _handleResponse(res, logLevel, resolve);
            });
        }

        req.on('error', (err) => {
            console.log(`\n-> Problem with request: ${err.message}`);
            reject(err);
        });

        // Write data to request body
        req.write(requestBody);
        req.end();

    });
}

module.exports = sendRequest;
