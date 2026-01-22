const path = require('path');
const {
    stamp,
    dateTime,
    asyncRetrySimple,
    asyncRetryCustom,
    createRequest,
    sendRequest,
    readDirectories
} = require('../index.js');

// Test randomDigits
const randomDigits = stamp.getTimestamp();

console.log(
    'process.env.TIMESTAMP: ' +
    `${randomDigits === process.env.TIMESTAMP} ${process.env.TIMESTAMP}`
);

const newRandomDigits = stamp.resetTimestamp();

console.log(
    'process.env.TIMESTAMP: ' +
    `${newRandomDigits === process.env.TIMESTAMP} ${process.env.TIMESTAMP}`
);

const baseDecimal = 10;

if (
    parseInt(newRandomDigits, baseDecimal) > parseInt(randomDigits, baseDecimal)
) {
    console.log('randomDigits look ok!');
} else {
    throw new Error('newRandomDigits should be more than randomDigits');
}

// Test dateTime
const currentDateTime = dateTime.generateDateTime();

console.log(
    'process.env.DATETIME: ' +
    `${currentDateTime === process.env.DATETIME} ${process.env.DATETIME}`
);

const currentDateTimePlusHour = dateTime.generateDateTimePlusHours(1);

console.log(
    'process.env.DATETIME_PLUS_HOURS: ' +
    `${currentDateTimePlusHour === process.env.DATETIME_PLUS_HOURS} ` +
    process.env.DATETIME_PLUS_HOURS
);

const currentDateTimePlusMinute = dateTime.generateDateTimePlusMinutes(1);

console.log(
    'process.env.DATETIME_PLUS_MINUTES: ' +
    `${currentDateTimePlusMinute === process.env.DATETIME_PLUS_MINUTES} ` +
    process.env.DATETIME_PLUS_MINUTES
);

const currentDateTimePlusSecond = dateTime.generateDateTimePlusSeconds(1);

console.log(
    'process.env.DATETIME_PLUS_SECONDS: ' +
    `${currentDateTimePlusSecond === process.env.DATETIME_PLUS_SECONDS} ` +
    process.env.DATETIME_PLUS_SECONDS
);

if (
    (Date.parse(currentDateTimePlusHour) > Date.parse(currentDateTimePlusMinute)) &&
        (Date.parse(currentDateTimePlusMinute) > Date.parse(currentDateTimePlusSecond)) &&
            (Date.parse(currentDateTimePlusSecond) > Date.parse(currentDateTime))
) {
    console.log('dateTime plus looks ok!');
} else {
    throw new Error('currentDateTimePlus Hour/Minute/Second should be more than currentDateTime');
}

const currentDateTimeMinusHour = dateTime.generateDateTimeMinusHours(1);

console.log(
    'process.env.DATETIME_MINUS_HOURS: ' +
    `${currentDateTimeMinusHour === process.env.DATETIME_MINUS_HOURS} ` +
    process.env.DATETIME_MINUS_HOURS
);

if (
    Date.parse(currentDateTimeMinusHour) < Date.parse(currentDateTime)
) {
    console.log('dateTime minus looks ok!');
} else {
    throw new Error('currentDateTimeMinus Hour should be less than currentDateTime');
}

(async () => {
    // Enable all logs output
    const logLevel = 2;
    // Generate random digits within a provided interval
    const _generateRandomDigit = async function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    const digitZero = 0;
    const digitTwo = 2;
    const digitTen = 10;
    const digitSeven = 7;

    // Test asyncRetrySimple
    const myFunctionSimple = async function () {
        return _generateRandomDigit(digitZero, digitTwo);
    };
    const asyncRetrySimpleResult = await asyncRetrySimple({
        functionToExecute: myFunctionSimple,
        attempts: 5,
        waitTime: 500,
        logLevel: 2
    });

    console.log(`asyncRetrySimpleResult: ${asyncRetrySimpleResult}`);

    // Test asyncRetryCustom
    const myFunctionCustom = async function () {
        return _generateRandomDigit(digitZero, digitTen);
    };
    const checkFunction = function (result) {
        return result > digitSeven;
    };

    const asyncRetryCustomResult = await asyncRetryCustom({
        functionToExecute: myFunctionCustom,
        functionToCheck: checkFunction,
        attempts: 20,
        waitTime: 1000,
        logLevel: 2
    });

    console.log(`asyncRetryCustomResult: ${asyncRetryCustomResult}`);

    // Test createRequest
    const responsePost = await createRequest(
        'POST',
        'http://httpbin.org/post',
        '{ "Content-Type": "application/json", "Authorization": "Bearer aBcD1234" }',
        '{ "test1": 1, "test2": 2 }',
        logLevel
    );

    console.log(`responsePost from createRequest: ${responsePost}`);

    // Test sendRequest
    const responsePost2 = await sendRequest({
        requestUrl: 'http://a:b@httpbin.org/post?query=string',
        method: 'POST',
        headersString: '{ "Content-Type": "application/json", "Authorization": "Bearer EfGh5678" }',
        logLevel: logLevel,
        bodyString: '{ "test3": 3, "test4": 4 }'
    });

    console.log(`responsePost from sendRequest: ${responsePost2}`);

    // Test readDirectories
    const pathToDirectory1 = path.join(__dirname, '..', 'utils');
    const pathToDirectory2 = path.join(__dirname);

    const allFiles = await readDirectories([pathToDirectory1, pathToDirectory2]);

    console.log('allFiles array:');
    allFiles.map((value) => {
        console.log(value);
    });

    if (allFiles.some((value) => value.includes('test_text.txt'))) {
        console.log('allFiles array looks ok!');
    } else {
        throw new Error('allFiles array should include "test_text.txt"');
    }
})();
