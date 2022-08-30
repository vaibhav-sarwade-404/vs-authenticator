import crypto, { BinaryLike } from "crypto";
import { Logger } from "@vs-org/logger";

export default class Helper {
  static getLogLevel = (): "info" | "debug" =>
    process.env.VS_AUTHENTICATOR_LOG_LEVEL === "info"
      ? "info"
      : process.env.VS_AUTHENTICATOR_LOG_LEVEL === "debug"
      ? "debug"
      : "info";

  static convertDecimalToHex = (num: number): number | string => {
    const logger = Logger.getInstance(this.getLogLevel()).getLogger(
      this.convertDecimalToHex.name
    );
    try {
      const number = Number(num);
      return number.toString(16).padStart(16, "0");
    } catch (error) {
      logger.error(
        `Something went wrong while converting number to hexadecimal with error: ${error}`
      );
      return num;
    }
  };

  static hex2Binary = (hex: string) =>
    parseInt(hex, 16).toString(2).padStart(8, "0");

  /**
   *
   * @param msg - string to generate hamc from
   * @param secret - secrete for generating hmac
   * @param {"sha1"} - hmac algo
   * @returns {string | never}
   *
   * @throws {error}
   */
  static getHMACHash = (
    msg: BinaryLike,
    secret: BinaryLike,
    algo: "sha1"
  ): Buffer => {
    const logger = Logger.getInstance(this.getLogLevel()).getLogger(
      this.getHMACHash.name
    );
    try {
      const hmac = crypto.createHmac(algo, secret);
      hmac.update(msg);
      return hmac.digest();
    } catch (error) {
      logger.error(
        `Something went wrong while generating HMAC hash for ${algo} with error: ${error}`
      );
      throw new Error(
        `Something went wrong while generating HMAC hash for ${algo}`
      );
    }
  };
}
