"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var logger_1 = require("@vs-org/logger");
var Helper = /** @class */ (function () {
    function Helper() {
    }
    var _a;
    _a = Helper;
    Helper.getLogLevel = function () {
        return process.env.VS_AUTHENTICATOR_LOG_LEVEL === "info"
            ? "info"
            : process.env.VS_AUTHENTICATOR_LOG_LEVEL === "debug"
                ? "debug"
                : "info";
    };
    Helper.convertDecimalToHex = function (num) {
        var logger = logger_1.Logger.getInstance(_a.getLogLevel()).getLogger(_a.convertDecimalToHex.name);
        try {
            var number = Number(num);
            return number.toString(16).padStart(16, "0");
        }
        catch (error) {
            logger.error("Something went wrong while converting number to hexadecimal with error: ".concat(error));
            return num;
        }
    };
    Helper.hex2Binary = function (hex) {
        return parseInt(hex, 16).toString(2).padStart(8, "0");
    };
    /**
     *
     * @param msg - string to generate hamc from
     * @param secret - secrete for generating hmac
     * @param {"sha1"} - hmac algo
     * @returns {string | never}
     *
     * @throws {error}
     */
    Helper.getHMACHash = function (msg, secret, algo) {
        var logger = logger_1.Logger.getInstance(_a.getLogLevel()).getLogger(_a.getHMACHash.name);
        try {
            var hmac = crypto_1.default.createHmac(algo, secret);
            hmac.update(msg);
            return hmac.digest();
        }
        catch (error) {
            logger.error("Something went wrong while generating HMAC hash for ".concat(algo, " with error: ").concat(error));
            throw new Error("Something went wrong while generating HMAC hash for ".concat(algo));
        }
    };
    return Helper;
}());
exports.default = Helper;
