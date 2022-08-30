"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("@vs-org/logger");
var helper_1 = __importDefault(require("./helper"));
var logLevel = helper_1.default.getLogLevel();
var appDirectory = fs_1.default.realpathSync(process.cwd());
var FileSystemUtils = /** @class */ (function () {
    function FileSystemUtils() {
    }
    var _a;
    _a = FileSystemUtils;
    FileSystemUtils.resolveApp = function (relativePath) {
        return path_1.default.resolve(appDirectory, relativePath);
    };
    FileSystemUtils.exist = function (dirPath) { return fs_1.default.existsSync(dirPath); };
    FileSystemUtils.createJsonFileWithContentSync = function (filePath, fileData) {
        fs_1.default.writeFileSync(_a.resolveApp(filePath), JSON.stringify(fileData, null, 4), { flag: "w+" });
    };
    FileSystemUtils.readJsonFileSync = function (filePath) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(_a.readJsonFileSync.name);
        try {
            return JSON.parse(fs_1.default.readFileSync(_a.resolveApp(filePath), "utf8"));
        }
        catch (error) {
            logger.error("Something went wrong while reading JSON file(".concat(filePath, ") with error:").concat(error, " "));
            throw error;
        }
    };
    FileSystemUtils.writeJsonFileSync = function (filePath, data) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(_a.writeJsonFileSync.name);
        try {
            fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 4), "utf8");
        }
        catch (error) {
            logger.error("Something went wrong while writting to JSON file(".concat(filePath, ") with error:").concat(error, " "));
            throw error;
        }
    };
    FileSystemUtils.deleteFileSync = function (fileName) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(_a.deleteFileSync.name);
        try {
            fs_1.default.rmSync(fileName);
        }
        catch (error) {
            logger.error("Something went wrong while deleting file(".concat(fileName, ") with error:").concat(error, " "));
            throw error;
        }
    };
    FileSystemUtils.makeDirSync = function (dirName) {
        var logger = logger_1.Logger.getInstance(logLevel).getLogger(_a.makeDirSync.name);
        try {
            fs_1.default.mkdirSync(dirName);
        }
        catch (error) {
            logger.error("Something went wrong while creating directory(".concat(dirName, ") with error:").concat(error, " "));
            throw error;
        }
    };
    return FileSystemUtils;
}());
exports.default = FileSystemUtils;
