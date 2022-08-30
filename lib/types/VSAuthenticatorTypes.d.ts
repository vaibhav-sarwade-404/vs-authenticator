export declare type Connection = {
    name: string;
    email: string;
    secret: string;
    totpUrl: string;
    createdTime: string;
};
export declare type Connections = {
    [connectionName: string]: Connection;
};
export declare type Secret = {
    plainSecret: string;
    base32Secret: string;
    totpIssuerUrl: string;
};
declare type RandomCharTypes = "numbers" | "uppercase" | "lowercase" | "symbols" | "random";
export declare type RecoveryCodesOptions = {
    codeType: RandomCharTypes;
    codeLength: number;
    numberOfCodes: number;
    charset?: string;
};
export {};
