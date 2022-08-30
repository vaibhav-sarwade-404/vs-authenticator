import { RecoveryCodesOptions, Secret } from "./types/VSAuthenticatorTypes";
export default class VsAuthenticator {
    private static timeStep;
    /**
     * Use this to generate secrete for each user
     * @returns {string} - returns secrete object
     * @throws {Error}
     *
     * Eg: vsAuthenticatorInstance.generateSecret("user1","user1@email.com");
     */
    static generateSecret(name?: string, issuer?: string): Secret;
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
    private static _generateTOTP;
    /**
     * @returns {string | never} - returns TOTP as number or undefined incase of errors
     *
     * @throws {Error}
     */
    static generateTOTP(secret: string): string | never;
    /**
     * Verification is done only for 2 time steps (current and one before). We shouldn't want to allow all OTP's as valid OTP's apart from this.
     * In future if there is need to increase this buffer then we can take one more parameter to this function.
     * @param totp - totp
     * @param secret - secret
     * @returns {boolean} - returns true if TOTP is valid and false if it is invalid
     *
     * @throws {Error}
     */
    static verifyTOTP(totp: string, secret: string, prevTimeSteps?: number): boolean;
}
