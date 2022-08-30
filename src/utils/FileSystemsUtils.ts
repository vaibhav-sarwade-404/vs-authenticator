import path from "path";
import fs from "fs";
import { Logger } from "@vs-org/logger";

import { Connections } from "../types/VSAuthenticatorTypes";
import Helper from "./helper";

const logLevel = Helper.getLogLevel();
const appDirectory = fs.realpathSync(process.cwd());

class FileSystemUtils {
  static resolveApp = (relativePath: string) =>
    path.resolve(appDirectory, relativePath);

  static exist = (dirPath: string) => fs.existsSync(dirPath);

  static createJsonFileWithContentSync = (
    filePath: string,
    fileData: Connections
  ) => {
    fs.writeFileSync(
      this.resolveApp(filePath),
      JSON.stringify(fileData, null, 4),
      { flag: "w+" }
    );
  };

  static readJsonFileSync = (filePath: string): Connections => {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.readJsonFileSync.name
    );
    try {
      return JSON.parse(fs.readFileSync(this.resolveApp(filePath), "utf8"));
    } catch (error) {
      logger.error(
        `Something went wrong while reading JSON file(${filePath}) with error:${error} `
      );
      throw error;
    }
  };

  static writeJsonFileSync = (filePath: string, data: Connections) => {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.writeJsonFileSync.name
    );
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 4), "utf8");
    } catch (error) {
      logger.error(
        `Something went wrong while writting to JSON file(${filePath}) with error:${error} `
      );
      throw error;
    }
  };

  static deleteFileSync = (fileName: string) => {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.deleteFileSync.name
    );
    try {
      fs.rmSync(fileName);
    } catch (error) {
      logger.error(
        `Something went wrong while deleting file(${fileName}) with error:${error} `
      );
      throw error;
    }
  };

  static makeDirSync = (dirName: string) => {
    const logger = Logger.getInstance(logLevel).getLogger(
      this.makeDirSync.name
    );
    try {
      fs.mkdirSync(dirName);
    } catch (error) {
      logger.error(
        `Something went wrong while creating directory(${dirName}) with error:${error} `
      );
      throw error;
    }
  };
}

export default FileSystemUtils;
