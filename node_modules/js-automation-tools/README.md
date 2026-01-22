# js-automation-tools

A collection of scripts for JavaScript test automation

[![Actions Status](https://github.com/Marketionist/js-automation-tools/workflows/Build%20and%20Test/badge.svg)](https://github.com/Marketionist/js-automation-tools/actions)
[![npm version](https://img.shields.io/npm/v/js-automation-tools.svg)](https://www.npmjs.com/package/js-automation-tools)
[![NPM License](https://img.shields.io/npm/l/js-automation-tools.svg)](https://github.com/Marketionist/js-automation-tools/blob/master/LICENSE)

## Supported versions
[Node.js](https://nodejs.org/en/download/package-manager): 8.x-22.x.
> Note: if you are choosing a version of Node.js to run with - check
> [release schedule](https://nodejs.org/en/about/previous-releases).

## Table of contents
* [Installation](#installation)
* [Generate timestamp or random digits](#generate-timestamp-or-random-digits)
* [Generate current date and time](#generate-current-date-and-time)
* [Async retry](#async-retry)
* [Send GET, POST and other requests](#send-get-post-and-other-requests)
* [Read directories](#read-directories)
* [Contributing](#contributing)
* [Thanks](#thanks)

## Installation
To install js-automation-tools and save it to your `package.json` just run:
```
npm install js-automation-tools --save-dev
```

## Generate timestamp or random digits
There ususally is a need to generate random names. Timestamp can be used to
generate a unique string of 13+ digits:
```
const { stamp } = require('js-automation-tools');

const randomDigits = stamp.getTimestamp(); // '1588556993141'
const newTestName = `My new test ${randomDigits}`; // 'My new test 1588556993141'
```
It will also write generated digits to a global environment variable
`process.env.TIMESTAMP` that can be easily accessed in any place of your tests:
```
console.log(process.env.TIMESTAMP); // '1588556993141'
```
To get new timestamp:
```
const newRandomDigits = stamp.resetTimestamp(); // '1588558255810'

console.log(process.env.TIMESTAMP); // '1588558255810'
```

## Generate current date and time
Sometimes you need to generate current date and time. It can easily be done like this:
```
const { dateTime } = require('js-automation-tools');

const currentDateTime = dateTime.generateDateTime(); // '2024-03-14T00:14:25'
const currentDateTimePlusHour = dateTime.generateDateTimePlusHours(1); // '2024-03-14T01:14:25'
const currentDateTimePlusMinute = dateTime.generateDateTimePlusMinutes(1); // '2024-03-14T00:15:25'
const currentDateTimePlusSecond = dateTime.generateDateTimePlusSeconds(1); // '2024-03-14T00:14:26'

const currentDateTimeMinusHour = dateTime.generateDateTimeMinusHours(1); // '2024-03-13T23:14:25'
```
It will also write generated digits to a global environment variable
`process.env.DATETIME` and `process.env.DATETIME_PLUS_HOURS`, `process.env.DATETIME_PLUS_MINUTES`, `process.env.DATETIME_PLUS_SECONDS`,`process.env.DATETIME_MINUS_HOURS` that can be easily accessed in any place of your tests:
```
console.log(process.env.DATETIME); // '2024-03-14T00:14:25'
console.log(process.env.DATETIME_PLUS_HOURS); // '2024-03-14T01:14:25'
console.log(process.env.DATETIME_PLUS_MINUTES); // '2024-03-14T00:15:25'
console.log(process.env.DATETIME_PLUS_SECONDS); // '2024-03-14T00:14:26'

console.log(process.env.DATETIME_MINUS_HOURS); // '2024-03-13T23:14:25'
```

## Async retry
### asyncRetrySimple
Execute a provided function once per a provided amount of milliseconds until
this function will return a truthy value or the amount of provided attempts will
be exceeded:
```
const { asyncRetrySimple } = require('js-automation-tools');

const myFunction = async function () {
    return getSomeData(); // If successful - should return a truthy value
};

const result = await asyncRetrySimple(myFunction, 5, 2000, 1); // myFunction will be executed every 2 seconds up to 5 times until its result will be truthy
console.log(`result: ${result}`); // { data: 'Some data', statusCode: 200 }
```

**OR** you can specify the arguments inside the object as `key: value` pairs:

```
const { asyncRetrySimple } = require('js-automation-tools');

const myFunction = async function () {
    return getSomeData(); // If successful - should return a truthy value
};

const result = await asyncRetrySimple({
    functionToExecute: myFunction,
    attempts: 5,
    waitTime: 2000,
    logLevel: 1
}); // myFunction will be executed every 2 seconds up to 5 times until its result will be truthy
console.log(`result: ${result}`); // { data: 'Some data', statusCode: 200 }
```
### asyncRetryCustom
Execute a provided function once per a provided amount of milliseconds until
this function will return a value that upon passing a `functionCheck`
check will be `true` or the amount of provided attempts will be exceeded:
```
const { asyncRetryCustom } = require('js-automation-tools');

const myFunction = async function () {
    const response = await getSomeData();
    return response.result;
};
const checkFunction = function (result) {
    return result.statusCode === 200;
};

const result = await asyncRetryCustom(myFunction, checkFunction, 10, 3000, 2); // myFunction will be executed every 3 seconds up to 10 times until its result statusCode will be 200
console.log(`result: ${result}`); // { data: 'Some data', statusCode: 200 }
```

**OR** you can specify the arguments inside the object as `key: value` pairs:

```
const { asyncRetryCustom } = require('js-automation-tools');

const myFunction = async function () {
    const response = await getSomeData();
    return response.result;
};
const checkFunction = function (result) {
    return result.statusCode === 200;
};

const result = await asyncRetryCustom({
    functionToExecute: myFunction,
    functionToCheck: checkFunction,
    attempts: 10,
    waitTime: 3000,
    logLevel: 2
}); // myFunction will be executed every 3 seconds up to 10 times until its result statusCode will be 200
console.log(`result: ${result}`); // { data: 'Some data', statusCode: 200 }
```

## Send GET, POST and other requests
Send request to any URL and get response - `sendRequest` function accepts 5
arguments:
1. Method - string (for example: `'GET'` or `'POST'` or `'DELETE'` or any other).
2. Request URL - string (for example: `'https://www.google.com/'`).
3. Headers - string (for example: `'{ "Content-Type": "application/json", "Authorization": "Bearer aBcD1234" }'`).
4. Body - string (for example: `'{ "test1": 1, "test2": 2 }'`).
5. Log level - number (for example: `0` or `1` or `2`).

Or just call `sendRequest` function with empty string (`''`) instead of any
argument if it's not needed in your request:
```
const { sendRequest } = require('js-automation-tools');

const responseGet = await sendRequest(
    'GET',
    'https://www.google.com/',
    '',
    '',
    2
);

const responsePost = await sendRequest(
    'POST',
    'http://httpbin.org/post',
    '{ "Content-Type": "application/json", "Authorization": "Bearer aBcD1234" }',
    '{ "test1": 1, "test2": 2 }',
    1
);
```

**OR** you can specify the arguments inside the object as `key: value` pairs:

```
const { sendRequest } = require('js-automation-tools');

const responseGet = await sendRequest({
    method: 'GET',
    requestUrl: 'https://www.google.com/'
});

const responsePost = await sendRequest({
    method: 'POST',
    requestUrl: 'http://httpbin.org/post',
    headersString: '{ "Content-Type": "application/json", "Authorization": "Bearer aBcD1234" }',
    bodyString: '{ "test1": 1, "test2": 2 }',
    logLevel: 1
});
```

> Note: you can also use `createRequest` function - it is an alias and works
> exactly the same as `sendRequest`, for example:

```
const { createRequest } = require('js-automation-tools');

const responseGet = await createRequest({
    method: 'GET',
    requestUrl: 'https://www.google.com/'
});

const responsePost = await createRequest({
    method: 'POST',
    requestUrl: 'http://httpbin.org/post',
    headersString: '{ "Content-Type": "application/json", "Authorization": "Bearer aBcD1234" }',
    bodyString: '{ "test1": 1, "test2": 2 }',
    logLevel: 1
});
```

By default logs are disabled (`logLevel` set to `0`). You can set logging output
to one of 3 levels:
- `0` - logs disabled (by default)
- `1` - partial logs are enabled - prints out:
  * Response status code
  * Response body
- `2` - full logs are enabled - prints out:
  * Response status code
  * Response headers
  * Response body

## Read directories
Read the array of directories and get the array of files from this directories:
```
const { readDirectories } = require('js-automation-tools');

const pathToDirectory1 = path.join(__dirname, 'directory1');
const pathToDirectory2 = path.join(__dirname, '..', '..', 'directory2');

const allFiles = await readDirectories([pathToDirectory1, pathToDirectory2]);
```

## Contributing
You are welcome to contribute to this repository - please see
[CONTRIBUTING.md](https://github.com/Marketionist/js-automation-tools/blob/master/CONTRIBUTING.md)
to help you get started. It is not mandatory, so you can just create a pull
request and we will help you refine it along the way.

## Thanks
If this package was helpful to you, please give it a **★ Star** on
[GitHub](https://github.com/Marketionist/js-automation-tools).
