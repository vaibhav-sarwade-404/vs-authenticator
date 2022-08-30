export type Connection = {
  name: string;
  email: string;
  secret: string;
  totpUrl: string;
  createdTime: string;
};

export type Connections = {
  [connectionName: string]: Connection;
};

export type Secret = {
  plainSecret: string;
  base32Secret: string;
  totpIssuerUrl: string;
};

type RandomCharTypes =
  | "numbers"
  | "uppercase"
  | "lowercase"
  | "symbols"
  | "random";

export type RecoveryCodesOptions = {
  codeType: RandomCharTypes;
  codeLength: number;
  numberOfCodes: number;
  charset?: string;
};
