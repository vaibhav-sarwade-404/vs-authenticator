import { Connection, RecoveryCodesOptions, Secret } from "./types/VSAuthenticatorTypes";
export default class VsAuthenticatorWithSecretHandler {
    private vsAuthenticatorConnections;
    private filePath;
    private timeStep;
    private static instance;
    /**
     *
     * @param filePath - file path to save config, it can be any custom path for the file
     * @throws {Error}
     */
    private constructor();
    /**
     *
     * @param filePath - config file path
     * @returns {VsAuthenticatorWithSecretHandler} - instance
     * @throws {Error}
     */
    static getInstance(filePath?: string): VsAuthenticatorWithSecretHandler;
    /**
     * This is for just for testing as secret handler is using JSON file to store secrets.
     * @param connectionName - connection name
     * @param email - user email
     * @param secret - connection secret
     *
     * @throws {Error} - Runtime errors
     */
    createConnection(connectionName: string, email: string, secret?: string): void | never;
    /**
     * This is for just for testing as secret handler is using JSON file to store secrets.
     * @param connectionName - connection name
     * @throws {Error} - Runtime errors
     */
    deleteConnection(connectionName: string): void | never;
    /**
     * This is for just for testing as secret handler is using JSON file to store secrets.
     * @param connectionName - connection name
     * @returns {Connection | undefined} - returns connection if configured
     * @throws {Error}
     */
    getConnection(connectionName: string): Connection | undefined;
    /**
     * Use this to generate secrete for each user
     * @returns {string} - returns secrete object
     * @throws {Error}
     *
     * Eg: vsAuthenticatorInstance.generateSecret("user1","user1@email.com");
     */
    generateSecret(name?: string, issuer?: string): Secret;
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
    static generateRecoverCodes(options: RecoveryCodesOptions): Array<string>;
    /**
     *
     *
     * @param secret
     * @param _timeStep
     * @returns {string} - TOTP
     */
    private _generateTOTP;
    /**
     * Use this for internal testing, as secrets are stored in JSON file in project. Instead use generateTOTP() for generating TOTP for end users
     * @param connectionName - connection name
     * @returns {string | never} - returns TOTP as number or undefined incase of errors
     *
     * @throws {Error}
     */
    generateTOTPForConnection(connectionName: string): string | never;
    /**
     * @returns {string | never} - returns TOTP as number or undefined incase of errors
     *
     * @throws {Error}
     */
    generateTOTP(secret: string): string | never;
    /**
     * Verification is done only for 2 time steps (current and one before). We shouldn't want to allow all OTP's as valid OTP's apart from this.
     * In future if there is need to increase this buffer then we can take one more parameter to this function.
     * @param totp - totp
     * @param secret - secret
     * @returns {boolean} - returns true if TOTP is valid and false if it is invalid
     *
     * @throws {Error}
     */
    verifyTOTP(totp: string, secret: string): boolean;
}
