/// <reference types="node" />
import { BinaryLike } from "crypto";
export default class Helper {
    static getLogLevel: () => "info" | "debug";
    static convertDecimalToHex: (num: number) => number | string;
    static hex2Binary: (hex: string) => string;
    /**
     *
     * @param msg - string to generate hamc from
     * @param secret - secrete for generating hmac
     * @param {"sha1"} - hmac algo
     * @returns {string | never}
     *
     * @throws {error}
     */
    static getHMACHash: (msg: BinaryLike, secret: BinaryLike, algo: "sha1") => Buffer;
}
