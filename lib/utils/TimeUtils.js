"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeUtils = /** @class */ (function () {
    function TimeUtils() {
    }
    /**
     *
     * @returns {string} - returns UTC time string
     */
    TimeUtils.getCurrentUTCTime = function () {
        return new Date().toUTCString();
    };
    /**
     *
     * @returns {number} - returns seconds passed from 1st Jan 1970 in UTC
     */
    TimeUtils.getCurrentUTCTimeInSeconds = function () {
        return Date.parse(new Date().toUTCString()) / 1000;
    };
    return TimeUtils;
}());
exports.default = TimeUtils;
