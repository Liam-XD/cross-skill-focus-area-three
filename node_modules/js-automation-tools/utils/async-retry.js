'use strict';

// #############################################################################

const _attemptsDefault = 10;
const _waitTimeDefault = 1000;
const _logLevelDefault = 0;
const _spacesToIndent = 4;
const _notificationAttemptNumber = '\n-> Running %s - attempt: %d';
const _notificationFunctionToExecuteResponse = '\n-> Response from';
const _errorSpecifyFunctionToExecute = '\n-> Please specify functionToExecute function';
const _errorSpecifyFunctionToCheck = '\n-> Please specify functionToCheck function';
const _errorFailedFunctionToExecute = '\n-> Provided number of attempts was exceeded - executed';

/**
 * Executes a provided function once per a provided amount of milliseconds
 * until this function will return a truthy value or the amount of provided attempts will be exceeded
 * @param {Function} functionToExecute function to execute (if successful - should return a truthy value)
 * @param {Number} attempts number of attempts to retry (default value: `10`)
 * @param {Number} waitTime time to wait between retries (in milliseconds, default value: `1000`)
 * @param {Number} logLevel must be an integer: 0 or 1 or 2 (default value: `0` - disabled)
 * @returns {Promise} response of a function that was provided for execution
 */
async function asyncRetrySimple (
    functionToExecute,
    attempts = _attemptsDefault,
    waitTime = _waitTimeDefault,
    logLevel = _logLevelDefault
) {
    if (typeof arguments[0] === 'object') {
        /* eslint-disable no-param-reassign */
        functionToExecute = arguments[0].functionToExecute;
        attempts = arguments[0].attempts || _attemptsDefault;
        waitTime = arguments[0].waitTime || _waitTimeDefault;
        logLevel = arguments[0].logLevel || _logLevelDefault;
        /* eslint-enable no-param-reassign */
    }
    if (functionToExecute === undefined || typeof functionToExecute !== 'function') {
        throw new Error(_errorSpecifyFunctionToExecute);
    }
    const result = new Promise((resolve, reject) => {
        let iteration = 0;
        const intervalId = setInterval(async () => {
            if (logLevel > 0) {
                console.info(_notificationAttemptNumber, functionToExecute.name, iteration);
            }
            const res = await functionToExecute();

            if (logLevel === 2) {
                console.info(
                    `${_notificationFunctionToExecuteResponse} ${functionToExecute.name}:`,
                    JSON.stringify(res, null, _spacesToIndent)
                );
            }

            if (res) {
                clearInterval(intervalId);
                return resolve(res);
            } else if (iteration < attempts) {
                iteration++;
            } else {
                clearInterval(intervalId);
                return reject(new Error(`${_errorFailedFunctionToExecute} ${functionToExecute.name} x ${attempts}`));
            }
        }, waitTime)
    });

    return result;
}

/**
 * Executes a provided function (`functionToExecute`) once per a provided amount
 * of milliseconds until this function will return a value that upon passing a
 * `functionToCheck` check will be `true` or the amount of provided attempts will be exceeded
 * @param {Function} functionToExecute function to execute (for example an API request)
 * @param {Function} functionToCheck function to execute to check the result of
 * `functionToExecute` (if successful - should return `true`, for example: `(responseBody) => responseBody.length > 0`)
 * @param {Number} attempts number of attempts to retry (default value: `10`)
 * @param {Number} waitTime time to wait between retries (in milliseconds, default value: `1000`)
 * @param {Number} logLevel must be an integer: 0 or 1 or 2 (default value: `0` - disabled)
 * @returns {Promise} response of a function that was provided for execution
 */
async function asyncRetryCustom (
    functionToExecute,
    functionToCheck,
    attempts = _attemptsDefault,
    waitTime = _waitTimeDefault,
    logLevel = _logLevelDefault
) {
    if (typeof arguments[0] === 'object') {
        /* eslint-disable no-param-reassign */
        functionToExecute = arguments[0].functionToExecute;
        functionToCheck = arguments[0].functionToCheck;
        attempts = arguments[0].attempts || _attemptsDefault;
        waitTime = arguments[0].waitTime || _waitTimeDefault;
        logLevel = arguments[0].logLevel || _logLevelDefault;
        /* eslint-enable no-param-reassign */
    }
    if (functionToExecute === undefined || typeof functionToExecute !== 'function') {
        throw new Error(_errorSpecifyFunctionToExecute);
    }
    if (functionToCheck === undefined || typeof functionToCheck !== 'function') {
        throw new Error(_errorSpecifyFunctionToCheck);
    }
    const result = new Promise((resolve, reject) => {
        let iteration = 0;
        const intervalId = setInterval(async () => {
            if (logLevel > 0) {
                console.info(_notificationAttemptNumber, functionToExecute.name, iteration);
            }
            const res = await functionToExecute();

            if (logLevel === 2) {
                console.info(
                    `${_notificationFunctionToExecuteResponse} ${functionToExecute.name}:`,
                    JSON.stringify(res, null, _spacesToIndent)
                );
            }

            if (functionToCheck(res)) {
                clearInterval(intervalId);
                return resolve(res);
            } else if (iteration < attempts) {
                iteration++;
            } else {
                clearInterval(intervalId);
                return reject(new Error(`${_errorFailedFunctionToExecute} ${functionToExecute.name} x ${attempts}`));
            }
        }, waitTime)
    });

    return result;
}

module.exports = {
    asyncRetrySimple: asyncRetrySimple,
    asyncRetryCustom: asyncRetryCustom
};
