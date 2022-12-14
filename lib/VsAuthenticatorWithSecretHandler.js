"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var logger_1 = require("@vs-org/logger");
var base_32_1 = require("@vs-org/base-32");
var random_1 = __importDefault(require("@vs-org/random"));
var FileSystemsUtils_1 = __importDefault(require("./utils/FileSystemsUtils"));
var TimeUtils_1 = __importDefault(require("./utils/TimeUtils"));
var helper_1 = __importDefault(require("./utils/helper"));
var logLevel = helper_1.default.getLogLevel();
var VsAuthenticatorWithSecretHandler = /** @class */ (function () {
    /**
     *
     * @param filePath - file path to save config, it can be any custom path for the file
     * @throws {Error}
     */
    function VsAuthenticatorWithSecretHandler(filePath) {
        var _this = this;
        this.vsAuthenticatorConnections = {};
        this.filePath = path_1.default.join("config", "connections.json");
        this.timeStep = 30;
        /**
         *
         *
         * @param secret
         * @param _timeStep
         * @returns {string} - TOTP
         */
        this._generateTOTP = function (secret, _timeStep) {
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
            var timeStep = _timeStep ||
                Math.floor(TimeUtils_1.default.getCurrentUTCTimeInSeconds() / _this.timeStep);
            var hexTimeStep = Math.round(Number(timeStep))
                .toString(16)
                .padStart(16, "0");
            var _secret = (0, base_32_1.base32Decode)(secret);
            var hash = helper_1.default.getHMACHash(Buffer.from(hexTimeStep, "hex"), Buffer.from(_secret, "ascii"), "sha1");
            var offset = hash[hash.length - 1] & 0xf;
            var code = ((hash[offset] & 0x7f) << 24) |
                ((hash[offset + 1] & 0xff) << 16) |
                ((hash[offset + 2] & 0xff) << 8) |
                (hash[offset + 3] & 0xff);
            return (code % Math.pow(10, 6)).toString().padStart(6, "0");
        };
        var logger = logger_1.Logger.getInstance(logLevel).getLogger("".concat(VsAuthenticatorWithSecretHandler.name, ".constructor"));
        try {
            if (!filePath) {
                filePath = this.filePath;
            }
            if (!FileSystemsUtils_1.default.exist(filePath)) {
                !FileSystemsUtils_1.default.exist("config") &&
                    FileSystemsUtils_1.default.makeDirSync("config");
                FileSystemsUtils_1.default.createJsonFileWithContentSync(filePath, {});
                this.filePath = filePath;
            }
            else {
                this.vsAuthenticatorConnections = FileSystemsUtils_1.default.readJsonFileSync(this.filePath);
            }
        }
        catch (error) {
            logger.error("Something went wrong while creating VS Authenticator instance with error: ".concat(error));
            throw new Error("Something went wrong while creating VS Authenticator instance");
        }
    }
    /**
     *
     * @param filePath - config file path
     * @returns {VsAuthenticatorWithSecretHandler} - instance
     * @throws {Error}
     */
    VsAuthenticatorWithSecretHandler.getInstance = function (filePath) {
        if (!VsAuthenticatorWithSecretHandler.instance) {
            VsAuthenticatorWithSecretHandler.instance =
                new VsAuthenticatorWithSecretHandler(filePath);
        }
        return VsAuthenticatorWithSecretHandler.instance;
    };
    /**
     * This is for just for testing as secret handler is using JSON file to store secrets.
     * @param connectionName - connection name
     * @param email - user email
     * @param secret - connection secret
     *
     * @throws {Error} - Runtime errors
     */
    VsAuthenticatorWithSecretHandler.prototype.createConnection = function (connectionName, email, secret) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.createConnection.name);
        try {
            var VsAuthenticatorConnections = FileSystemsUtils_1.default.readJsonFileSync(this.filePath);
            var _secret = {
                base32Secret: "",
                plainSecret: "",
                totpIssuerUrl: ""
            };
            if (!secret) {
                _secret = this.generateSecret(connectionName, email);
            }
            var prevConnection = VsAuthenticatorConnections[connectionName];
            if (!!prevConnection) {
                throw new Error("Connection with connection name(".concat(connectionName, "), connection name should be unique, or try deleting old connection with VsAuthenticator.deleteConnection(").concat(connectionName, ") method"));
            }
            VsAuthenticatorConnections[connectionName] = {
                name: connectionName,
                email: email,
                secret: secret || _secret.base32Secret,
                totpUrl: !secret
                    ? _secret.totpIssuerUrl
                    : "otpauth://totp/".concat(connectionName, "?secret=").concat(secret, "&issuer=").concat(email),
                createdTime: TimeUtils_1.default.getCurrentUTCTime()
            };
            this.vsAuthenticatorConnections = VsAuthenticatorConnections;
            FileSystemsUtils_1.default.writeJsonFileSync(this.filePath, VsAuthenticatorConnections);
            logger.info("connection created successfully");
        }
        catch (error) {
            logger.error("Something went wrong while creating new connection with name (".concat(connectionName, ") for user (").concat(email, ") with error: ").concat(error));
            throw new Error("Something went wrong while creating new connection");
        }
    };
    /**
     * This is for just for testing as secret handler is using JSON file to store secrets.
     * @param connectionName - connection name
     * @throws {Error} - Runtime errors
     */
    VsAuthenticatorWithSecretHandler.prototype.deleteConnection = function (connectionName) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.deleteConnection.name);
        try {
            var VsAuthenticatorConnections = FileSystemsUtils_1.default.readJsonFileSync(this.filePath);
            var _a = VsAuthenticatorConnections, _b = connectionName, connection = _a[_b], remainingConnections = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
            if (!connection) {
                logger.info("connection(".concat(connectionName, ") not found"));
                return;
            }
            FileSystemsUtils_1.default.writeJsonFileSync(this.filePath, remainingConnections);
            logger.info("connection(".concat(connectionName, ") deleted successfully"));
        }
        catch (error) {
            logger.error("Something went wrong while creating deleting with name (".concat(connectionName, ") with error: ").concat(error));
            throw new Error("Something went wrong while creating new connection");
        }
    };
    /**
     * This is for just for testing as secret handler is using JSON file to store secrets.
     * @param connectionName - connection name
     * @returns {Connection | undefined} - returns connection if configured
     * @throws {Error}
     */
    VsAuthenticatorWithSecretHandler.prototype.getConnection = function (connectionName) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.getConnection.name);
        try {
            return this.vsAuthenticatorConnections[connectionName];
        }
        catch (error) {
            logger.error("Something went wrong while checking connection with error:".concat(error));
        }
    };
    /**
     * Use this to generate secrete for each user
     * @returns {string} - returns secrete object
     * @throws {Error}
     *
     * Eg: vsAuthenticatorInstance.generateSecret("user1","user1@email.com");
     */
    VsAuthenticatorWithSecretHandler.prototype.generateSecret = function (name, issuer) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.generateSecret.name);
        try {
            var _secret = (0, random_1.default)({
                length: 32,
                type: "random"
            });
            if (!name || !issuer) {
                logger.warn("one of parameter name or issuer is not provided, skipping totpIssuerUrl generation");
            }
            var base32EncodedSecret = (0, base_32_1.base32Encode)(_secret);
            return {
                plainSecret: _secret,
                base32Secret: base32EncodedSecret,
                totpIssuerUrl: "otpauth://totp/".concat(name, "?secret=").concat(base32EncodedSecret).concat(issuer ? "&issuer=".concat(encodeURIComponent(issuer)) : "")
            };
        }
        catch (error) {
            logger.error("Something went wrong while checking connection with error:".concat(error));
        }
        return {
            plainSecret: "",
            base32Secret: "",
            totpIssuerUrl: ""
        };
    };
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
    VsAuthenticatorWithSecretHandler.generateRecoverCodes = function (options) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.generateRecoverCodes.name);
        logger.info("generating recovery codes with options ".concat(JSON.stringify(options)));
        if (!["numbers", "uppercase", "lowercase", "symbols", "random"].includes(options.codeType)) {
            options.codeType = "numbers";
        }
        try {
            var recoveryCodes = [];
            for (var i = 0; i < options.numberOfCodes; i++) {
                recoveryCodes.push((0, random_1.default)({
                    length: options.codeLength,
                    type: options.codeType
                }));
            }
            return recoveryCodes;
        }
        catch (error) {
            logger.error("Something went wrong while generating recovery codes with error:".concat(error));
        }
        return [];
    };
    /**
     * Use this for internal testing, as secrets are stored in JSON file in project. Instead use generateTOTP() for generating TOTP for end users
     * @param connectionName - connection name
     * @returns {string | never} - returns TOTP as number or undefined incase of errors
     *
     * @throws {Error}
     */
    VsAuthenticatorWithSecretHandler.prototype.generateTOTPForConnection = function (connectionName) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.generateTOTPForConnection.name);
        try {
            var connection = this.getConnection(connectionName);
            if (!connection) {
                throw new Error("connection (".concat(connectionName, ") does not exist, first configure connection to generate TOTP with ").concat(this.generateTOTP.name));
            }
            return this._generateTOTP(connection.secret);
        }
        catch (error) {
            logger.error("Something went wrong while generating OTP for connection (".concat(connectionName, ") with error: ").concat(error));
            throw new Error("Something went wrong while generation TOTP for connection (".concat(connectionName, ")"));
        }
    };
    /**
     * @returns {string | never} - returns TOTP as number or undefined incase of errors
     *
     * @throws {Error}
     */
    VsAuthenticatorWithSecretHandler.prototype.generateTOTP = function (secret) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.generateTOTP.name);
        try {
            if (!secret) {
                throw new Error("secret is required to generate TOTP");
            }
            return this._generateTOTP(secret);
        }
        catch (error) {
            logger.error("Something went wrong while generating OTP with error: ".concat(error));
            throw new Error("Something went wrong while generation TOTP for connection");
        }
    };
    /**
     * Verification is done only for 2 time steps (current and one before). We shouldn't want to allow all OTP's as valid OTP's apart from this.
     * In future if there is need to increase this buffer then we can take one more parameter to this function.
     * @param totp - totp
     * @param secret - secret
     * @returns {boolean} - returns true if TOTP is valid and false if it is invalid
     *
     * @throws {Error}
     */
    VsAuthenticatorWithSecretHandler.prototype.verifyTOTP = function (totp, secret) {
        var e_1, _a;
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(this.verifyTOTP.name);
        try {
            if (!totp || !secret) {
                throw new TypeError("totp and secret is required to verify OTP");
            }
            var verificationStatus = false;
            try {
                for (var _b = __values([0, 1]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var index = _c.value;
                    var timeStep = Math.floor(TimeUtils_1.default.getCurrentUTCTimeInSeconds() / this.timeStep);
                    var generatedTOTP = this._generateTOTP(secret, timeStep - index);
                    logger.info("User provided TOTP: ".concat(totp, ", result is ").concat(generatedTOTP === totp));
                    if (generatedTOTP === totp) {
                        verificationStatus = true;
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return verificationStatus;
        }
        catch (error) {
            logger.error("Something went wrong verifying TOTP: ".concat(error));
            return false;
        }
    };
    return VsAuthenticatorWithSecretHandler;
}());
exports.default = VsAuthenticatorWithSecretHandler;
