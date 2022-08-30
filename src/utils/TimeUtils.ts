export default class TimeUtils {
  /**
   *
   * @returns {string} - returns UTC time string
   */
  static getCurrentUTCTime = (): string => {
    return new Date().toUTCString();
  };

  /**
   *
   * @returns {number} - returns seconds passed from 1st Jan 1970 in UTC
   */
  static getCurrentUTCTimeInSeconds = (): number => {
    return Date.parse(new Date().toUTCString()) / 1000;
  };
}
