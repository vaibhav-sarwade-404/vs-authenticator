import { base32Decode, base32Encode } from "@vs-org/base-32";
import { Logger } from "@vs-org/logger";
import random from "@vs-org/random";

import TimeUtils from "./utils/TimeUtils";
import { RecoveryCodesOptions, Secret } from "./types/VSAuthenticatorTypes";
import Helper from "./utils/helper";

const logLevel = Helper.getLogLevel();

export default class VsAuthenticator {
  private static timeStep: number = 30;

  /**
   * Use this to generate secrete for each user
   * @returns {string} - returns secrete object
   * @throws {Error}
   *
   * Eg: vsAuthenticatorInstance.generateSecret("user1","user1@email.com");
   */
  static generateSecret(name?: string, issuer?: string): Secret {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.generateSecret.name
    );
    try {
      const _secret = random({
        length: 32,
        type: "random"
      });
      if (!name || !issuer) {
        logger.warn(
          `one of parameter name or issuer is not provided, skipping totpIssuerUrl generation`
        );
      }
      const base32EncodedSecret = base32Encode(_secret);
      return {
        plainSecret: _secret,
        base32Secret: base32EncodedSecret,
        totpIssuerUrl: `otpauth://totp/${name}?secret=${base32EncodedSecret}${
          issuer ? `&issuer=${encodeURIComponent(issuer)}` : ""
        }`
      };
    } catch (error) {
      logger.error(
        `Something went wrong while checking connection with error:${error}`
      );
    }
    return {
      plainSecret: "",
      base32Secret: "",
      totpIssuerUrl: ""
    };
  }

  /**
   * Helper method to generate recovery code, if user does have access to TOTP (device).
   * @param options
   * @param options.codeType --> Code type can be either numbers or alphabet. If it is not provided it will be defaulted to numbers
   * @param options.codeLength --> Length of each recover code
   * @param options.numberOfCodes --> How many recovery codes needs to be generated
   *
   * @returns { Array<string>  }
   * @throws { Error }
   */
  static generateRecoverCodes(options: RecoveryCodesOptions): Array<string> {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.generateRecoverCodes.name
    );
    if (
      !["numbers", "uppercase", "lowercase", "symbols", "random"].includes(
        options.codeType
      )
    ) {
      options.codeType = "numbers";
    }
    try {
      const recoveryCodes: Array<string> = [];
      for (let i = 0; i < options.numberOfCodes; i++) {
        recoveryCodes.push(
          random({
            length: options.codeLength,
            type: options.codeType
          })
        );
      }
      return recoveryCodes;
    } catch (error) {
      logger.error(
        `Something went wrong while generating recovery codes with error:${error}`
      );
    }
    return [];
  }

  /**
   *
   *
   * @param secret
   * @param _timeStep
   * @returns {string} - TOTP
   */
  private static _generateTOTP = (
    secret: string,
    _timeStep?: number
  ): string => {
    /**
     * 1. get UTC time in seconds
     * 2. Get time step with floor rounding Number of time step = floor(timeInUTC / step)
     * 3. Convert step into a hexadecimal value (16 hexadecimal chars = 8 bytes if not then prepend with 0)
     * 4. Convert hex value to 8 byte array Buffer.from('7468697320697320612074c3a97374', 'hex'); which is out MSG = M
     * 5. Shared secret key is randomly generated 20 bytes number which is base 32 encoded. Convert shared key in 20 bytes array = K
     * 6. Calculate HMAC with HMAMC-SHA1(M,K)
     * 7. Generated HMAC hash has 160 bits (20 bytes)
     * 8. Get last 4 bits of hash value and get its (hex to integer) intger value consider ["AF","16","86",......., "9A"]
     * 9. 9A = 10 = Offset
     * 10. starting from index 10 get 4 bytes of HMAC HASH ([....,F6, A7, F8, 99,.....])
     * 11. Apply binary operations ( F6 & 0x7F) = 76 ( A7 & 0xFF) = A7 ( F8 & 0xFF) =F8 ( 99 & 0xFF)=99
     * 12. New binary value is 0x76A7F899. Convert binary to integer 1990719641
     * 13. Calculate TOTP = 1990719641 % Math.pow(10,n) where n is size of token by default it is 6 = 717641
     * 14. If caculated TOTP has less than 6 digits then prefix it with 0
     * 15. Every 30 seconds TOTP is generated by it is valid for 60 secs
     */
    const timeStep =
      _timeStep ||
      Math.floor(TimeUtils.getCurrentUTCTimeInSeconds() / this.timeStep);
    const hexTimeStep = Math.round(Number(timeStep))
      .toString(16)
      .padStart(16, "0");
    const _secret = base32Decode(secret);
    const hash = Helper.getHMACHash(
      Buffer.from(hexTimeStep, "hex"),
      Buffer.from(_secret, "ascii"),
      "sha1"
    );
    let offset = hash[hash.length - 1] & 0xf;
    let code: number =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    return (code % Math.pow(10, 6)).toString().padStart(6, "0");
  };

  /**
   * @returns {string | never} - returns TOTP as number or undefined incase of errors
   *
   * @throws {Error}
   */
  static generateTOTP(secret: string): string | never {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.generateTOTP.name
    );
    try {
      if (!secret) {
        throw new Error(`secret is required to generate TOTP`);
      }
      return this._generateTOTP(secret);
    } catch (error) {
      logger.error(
        `Something went wrong while generating OTP with error: ${error}`
      );
      throw new Error(
        `Something went wrong while generation TOTP for connection`
      );
    }
  }

  /**
   * Verification is done only for 2 time steps (current and one before). We shouldn't want to allow all OTP's as valid OTP's apart from this.
   * In future if there is need to increase this buffer then we can take one more parameter to this function.
   * @param totp - totp
   * @param secret - secret
   * @returns {boolean} - returns true if TOTP is valid and false if it is invalid
   *
   * @throws {Error}
   */
  static verifyTOTP(
    totp: string,
    secret: string,
    prevTimeSteps?: number
  ): boolean {
    const logger = Logger.getInstance(logLevel).getLogger(this.verifyTOTP.name);
    try {
      if (!totp || !secret) {
        throw new TypeError(`totp and secret is required to verify OTP`);
      }
      let verificationStatus = false;
      for (let index = 0; index < (prevTimeSteps || 2); index++) {
        const timeStep = Math.floor(
          TimeUtils.getCurrentUTCTimeInSeconds() / this.timeStep
        );
        const generatedTOTP = this._generateTOTP(secret, timeStep - index);
        if (generatedTOTP === totp.toString()) {
          verificationStatus = true;
          break;
        }
      }
      return verificationStatus;
    } catch (error) {
      logger.error(`Something went wrong verifying TOTP: ${error}`);
      return false;
    }
  }
}