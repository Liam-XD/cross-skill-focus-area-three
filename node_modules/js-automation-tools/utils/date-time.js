'use strict';

// #############################################################################

let dateTime = {
    _minutesInHour: 60,
    _secondsInMinute: 60,
    _millisecondsInSecond: 1000,

    /**
     * Generates current date and time (for example: '2024-03-14T00:14:25')
     * @returns {String} date and time (for example: '2024-03-14T00:14:25')
     */
    generateDateTime: function () {
        process.env.DATETIME = new Date(
            new Date().toString().split('GMT')[0] + ' UTC'
        ).toISOString().split('.')[0];

        return process.env.DATETIME;
    },
    // ==== Plus functions =====================================================
    /**
     * Generates current date and time plus number of hours (for example: '2024-03-14T01:14:25')
     * @param {Number} hours number of hours that will be added to current date and time
     * @returns {String} date and time plus number of hours (for example: '2024-03-14T01:14:25')
     */
    generateDateTimePlusHours: function (hours) {
        process.env.DATETIME_PLUS_HOURS = new Date(
            new Date(Date.now() + hours *
                (
                    dateTime._minutesInHour *
                    dateTime._secondsInMinute *
                    dateTime._millisecondsInSecond
                )
            ).toString().split('GMT')[0] + ' UTC'
        ).toISOString().split('.')[0];

        return process.env.DATETIME_PLUS_HOURS;
    },
    /**
     * Generates current date and time plus number of minutes (for example: '2024-03-14T00:15:25')
     * @param {Number} minutes number of minutes that will be added to current date and time
     * @returns {String} date and time plus number of minutes (for example: '2024-03-14T00:15:25')
     */
    generateDateTimePlusMinutes: function (minutes) {
        process.env.DATETIME_PLUS_MINUTES = new Date(
            new Date(Date.now() +
                (
                    minutes *
                    dateTime._secondsInMinute *
                    dateTime._millisecondsInSecond
                )
            ).toString().split('GMT')[0] + ' UTC'
        ).toISOString().split('.')[0];

        return process.env.DATETIME_PLUS_MINUTES;
    },
    /**
     * Generates current date and time plus number of seconds (for example: '2024-03-14T00:14:26')
     * @param {Number} seconds number of seconds that will be added to current date and time
     * @returns {String} date and time plus number of seconds (for example: '2024-03-14T00:14:26')
     */
    generateDateTimePlusSeconds: function (seconds) {
        process.env.DATETIME_PLUS_SECONDS = new Date(
            new Date(
                Date.now() + (seconds * dateTime._millisecondsInSecond)
            ).toString().split('GMT')[0] + ' UTC'
        ).toISOString().split('.')[0];

        return process.env.DATETIME_PLUS_SECONDS;
    },
    // ==== Minus functions ====================================================
    /**
     * Generates current date and time minus number of hours (for example: '2024-03-13T23:14:25')
     * @param {Number} hours number of hours that will be added to current date and time
     * @returns {String} date and time minus number of hours (for example: '2024-03-13T23:14:25')
     */
    generateDateTimeMinusHours: function (hours) {
        process.env.DATETIME_MINUS_HOURS = new Date(
            new Date(Date.now() - hours *
                (
                    dateTime._minutesInHour *
                    dateTime._secondsInMinute *
                    dateTime._millisecondsInSecond
                )
            ).toString().split('GMT')[0] + ' UTC'
        ).toISOString().split('.')[0];

        return process.env.DATETIME_MINUS_HOURS;
    }
};

module.exports = dateTime;
