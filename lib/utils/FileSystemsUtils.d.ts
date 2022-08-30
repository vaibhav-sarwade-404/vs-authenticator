import { Connections } from "../types/VSAuthenticatorTypes";
declare class FileSystemUtils {
    static resolveApp: (relativePath: string) => string;
    static exist: (dirPath: string) => boolean;
    static createJsonFileWithContentSync: (filePath: string, fileData: Connections) => void;
    static readJsonFileSync: (filePath: string) => Connections;
    static writeJsonFileSync: (filePath: string, data: Connections) => void;
    static deleteFileSync: (fileName: string) => void;
    static makeDirSync: (dirName: string) => void;
}
export default FileSystemUtils;
