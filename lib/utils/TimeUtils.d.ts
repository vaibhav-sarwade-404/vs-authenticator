export default class TimeUtils {
    /**
     *
     * @returns {string} - returns UTC time string
     */
    static getCurrentUTCTime: () => string;
    /**
     *
     * @returns {number} - returns seconds passed from 1st Jan 1970 in UTC
     */
    static getCurrentUTCTimeInSeconds: () => number;
}
