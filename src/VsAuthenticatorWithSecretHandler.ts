import path from "path";
import { Logger } from "@vs-org/logger";
import { base32Encode, base32Decode } from "@vs-org/base-32";
import random from "@vs-org/random";

import {
  Connection,
  Connections,
  RecoveryCodesOptions,
  Secret
} from "./types/VSAuthenticatorTypes";

import FileSystemUtils from "./utils/FileSystemsUtils";
import TimeUtils from "./utils/TimeUtils";
import Helper from "./utils/helper";

const logLevel = Helper.getLogLevel();

export default class VsAuthenticatorWithSecretHandler {
  private vsAuthenticatorConnections: Connections = {};
  private filePath: string = path.join("config", "connections.json");
  private timeStep: number = 30;
  private static instance: VsAuthenticatorWithSecretHandler;

  /**
   *
   * @param filePath - file path to save config, it can be any custom path for the file
   * @throws {Error}
   */
  private constructor(filePath?: string) {
    const logger = Logger.getInstance(logLevel).getLogger(
      `${VsAuthenticatorWithSecretHandler.name}.constructor`
    );
    try {
      if (!filePath) {
        filePath = this.filePath;
      }
      if (!FileSystemUtils.exist(filePath)) {
        !FileSystemUtils.exist("config") &&
          FileSystemUtils.makeDirSync("config");
        FileSystemUtils.createJsonFileWithContentSync(filePath, {});
        this.filePath = filePath;
      } else {
        this.vsAuthenticatorConnections = FileSystemUtils.readJsonFileSync(
          this.filePath
        );
      }
    } catch (error) {
      logger.error(
        `Something went wrong while creating VS Authenticator instance with error: ${error}`
      );
      throw new Error(
        `Something went wrong while creating VS Authenticator instance`
      );
    }
  }

  /**
   *
   * @param filePath - config file path
   * @returns {VsAuthenticatorWithSecretHandler} - instance
   * @throws {Error}
   */
  public static getInstance(
    filePath?: string
  ): VsAuthenticatorWithSecretHandler {
    if (!VsAuthenticatorWithSecretHandler.instance) {
      VsAuthenticatorWithSecretHandler.instance =
        new VsAuthenticatorWithSecretHandler(filePath);
    }
    return VsAuthenticatorWithSecretHandler.instance;
  }

  /**
   * This is for just for testing as secret handler is using JSON file to store secrets.
   * @param connectionName - connection name
   * @param email - user email
   * @param secret - connection secret
   *
   * @throws {Error} - Runtime errors
   */
  public createConnection(
    connectionName: string,
    email: string,
    secret?: string
  ): void | never {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.createConnection.name
    );
    try {
      const VsAuthenticatorConnections: Connections =
        FileSystemUtils.readJsonFileSync(this.filePath);
      let _secret: Secret = {
        base32Secret: "",
        plainSecret: "",
        totpIssuerUrl: ""
      };
      if (!secret) {
        _secret = this.generateSecret(connectionName, email);
      }
      const prevConnection = VsAuthenticatorConnections[connectionName];

      if (!!prevConnection) {
        throw new Error(
          `Connection with connection name(${connectionName}), connection name should be unique, or try deleting old connection with VsAuthenticator.deleteConnection(${connectionName}) method`
        );
      }
      VsAuthenticatorConnections[connectionName] = {
        name: connectionName,
        email,
        secret: secret || _secret.base32Secret,
        totpUrl: !secret
          ? _secret.totpIssuerUrl
          : `otpauth://totp/${connectionName}?secret=${secret}&issuer=${email}`,
        createdTime: TimeUtils.getCurrentUTCTime()
      };
      this.vsAuthenticatorConnections = VsAuthenticatorConnections;
      FileSystemUtils.writeJsonFileSync(
        this.filePath,
        VsAuthenticatorConnections
      );
      logger.info(`connection created successfully`);
    } catch (error) {
      logger.error(
        `Something went wrong while creating new connection with name (${connectionName}) for user (${email}) with error: ${error}`
      );
      throw new Error(`Something went wrong while creating new connection`);
    }
  }

  /**
   * This is for just for testing as secret handler is using JSON file to store secrets.
   * @param connectionName - connection name
   * @throws {Error} - Runtime errors
   */
  public deleteConnection(connectionName: string): void | never {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.deleteConnection.name
    );
    try {
      const VsAuthenticatorConnections: Connections =
        FileSystemUtils.readJsonFileSync(this.filePath);
      const { [connectionName]: connection, ...remainingConnections } =
        VsAuthenticatorConnections;
      if (!connection) {
        logger.info(`connection(${connectionName}) not found`);
        return;
      }
      FileSystemUtils.writeJsonFileSync(this.filePath, remainingConnections);
      logger.info(`connection(${connectionName}) deleted successfully`);
    } catch (error) {
      logger.error(
        `Something went wrong while creating deleting with name (${connectionName}) with error: ${error}`
      );
      throw new Error(`Something went wrong while creating new connection`);
    }
  }

  /**
   * This is for just for testing as secret handler is using JSON file to store secrets.
   * @param connectionName - connection name
   * @returns {Connection | undefined} - returns connection if configured
   * @throws {Error}
   */
  public getConnection(connectionName: string): Connection | undefined {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.getConnection.name
    );
    try {
      return this.vsAuthenticatorConnections[connectionName];
    } catch (error) {
      logger.error(
        `Something went wrong while checking connection with error:${error}`
      );
    }
  }

  /**
   * Use this to generate secrete for each user
   * @returns {string} - returns secrete object
   * @throws {Error}
   *
   * Eg: vsAuthenticatorInstance.generateSecret("user1","user1@email.com");
   */
  public generateSecret(name?: string, issuer?: string): Secret {
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
  private _generateTOTP = (secret: string, _timeStep?: number): string => {
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
   * Use this for internal testing, as secrets are stored in JSON file in project. Instead use generateTOTP() for generating TOTP for end users
   * @param connectionName - connection name
   * @returns {string | never} - returns TOTP as number or undefined incase of errors
   *
   * @throws {Error}
   */
  public generateTOTPForConnection(connectionName: string): string | never {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.generateTOTPForConnection.name
    );
    try {
      const connection = this.getConnection(connectionName);
      if (!connection) {
        throw new Error(
          `connection (${connectionName}) does not exist, first configure connection to generate TOTP with ${this.generateTOTP.name}`
        );
      }
      return this._generateTOTP(connection.secret);
    } catch (error) {
      logger.error(
        `Something went wrong while generating OTP for connection (${connectionName}) with error: ${error}`
      );
      throw new Error(
        `Something went wrong while generation TOTP for connection (${connectionName})`
      );
    }
  }

  /**
   * @returns {string | never} - returns TOTP as number or undefined incase of errors
   *
   * @throws {Error}
   */
  public generateTOTP(secret: string): string | never {
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
  public verifyTOTP(totp: string, secret: string): boolean {
    const logger = Logger.getInstance(logLevel).getLogger(this.verifyTOTP.name);
    try {
      if (!totp || !secret) {
        throw new TypeError(`totp and secret is required to verify OTP`);
      }
      let verificationStatus = false;

      for (const index of [0, 1]) {
        const timeStep = Math.floor(
          TimeUtils.getCurrentUTCTimeInSeconds() / this.timeStep
        );
        const generatedTOTP = this._generateTOTP(secret, timeStep - index);
        if (generatedTOTP === totp) {
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
