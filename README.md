# vs-authenticator

This repo holds logic for generating TOTP (RFC6238) for 2FA

By default TOTP verification is based on 2 time step, meaning OTP is valid for 60 seconds. If there is need to validate TOTP from past then provide prevTimeSteps option

## How to use

# TOTP generation and verification

```
const VsAuthenticator = required("vs-authenticator");

const secret = VsAuthenticator.generateSecret();
const totp = VsAuthenticator.generateTOTP(secret.base32Secret);

// To verify TOTP provided by user
const isValidTOTP = VsAuthenticator.verifyTOTP( userProvidedTOTP, secret.base32Secret);

/**
* To verify past TOTP's
* Verify TOTP's from last 90 seconds ( as default step is of 30 seconds, 90 /30 = 3 )
*/
const isValidTOTP = VsAuthenticator.verifyTOTP( userProvidedTOTP, secret.base32Secret, 3);

```

# Recovery codes generation

1. Generate numbers as recover codes

```

const recoveryCodes = VsAuthenticator.generateRecoverCodes({
  codeLength: 6,
  codeType: "numbers",
  numberOfCodes: 20
});


// console.log(recoveryCodes);
[
  '438171', '090722', '317662',
  '804551', '375587', '452225',
  '306622', '028157', '174671',
  '035603', '057717', '058642',
  '106383', '469748', '854384',
  '475571', '351376', '500001',
  '253358', '514030'
]

```

<br/>
2. Generate recovery codes with lowercase alphabet

```

const recoveryCodes = VsAuthenticator.generateRecoverCodes({
  codeLength: 6,
  codeType: "lowercase",
  numberOfCodes: 20
});


// console.log(recoveryCodes);
[
  'kqeisx', 'oscatr', 'jxpdpf',
  'qymoaw', 'rkbatc', 'kqmvoe',
  'cprkgf', 'ahegif', 'oicjur',
  'wooivs', 'hyjmko', 'ouwgnv',
  'jvhkum', 'wkgyjp', 'cgjosq',
  'qbybjn', 'sciefw', 'cpawhe',
  'smbqng', 'qglkpm'
]

```

<br/>
3. Generate recovery codes with uppercase alphabet

```

const recoveryCodes = VsAuthenticator.generateRecoverCodes({
  codeLength: 6,
  codeType: "uppercase",
  numberOfCodes: 20
});


// console.log(recoveryCodes);
[
  'BSDDYS', 'XYOYVQ', 'NNXTVT',
  'EEJTOT', 'YNVJGS', 'AXIALT',
  'SAIHCL', 'QDRCHV', 'LNUGDF',
  'JGLQJR', 'FJKGVJ', 'MXVOKT',
  'CMFUDT', 'OSFMTV', 'PYXJGE',
  'ADXAJN', 'YSUFSF', 'OLCFKY',
  'IKIGOP', 'KMJPTI'
]

```

<br/>
4. Generate recovery codes with only symbols (not good practice but it is generic function that can generate random symbols from charset)

```

const recoveryCodes = VsAuthenticator.generateRecoverCodes({
  codeLength: 6,
  codeType: "symbols",
  numberOfCodes: 20
});


// console.log(recoveryCodes);
[
  '?<]?%}', '&#!&};', '}@,%@(',
  '@.&}(/', '{*.}%%', ']].*?!',
  '.?]#&(', '}?>*,#', ':!<@@>',
  ',.);:<', '#)$%.[', '],/>##',
  '{!@!()', ']</)>[', ',[#<#!',
  '?:@;:;', ',[:&(*', '*@,:*;',
  '?$!:]]', ';>;!,<'
]

```

<br/>
5. Generate recovery codes

```

const recoveryCodes = VsAuthenticator.generateRecoverCodes({
  codeLength: 6,
  codeType: "random",
  numberOfCodes: 20
});


// console.log(recoveryCodes);
[
  'GAT@A#', 'c4fxd;', 'o#@;6[',
  'KfZ4mY', 'xX.)b$', 'Fwa)qh',
  'AV$C7L', 'b;:7kh', 'l%it6T',
  '6d!>E)', '$0po(b', 'Mk*k5B',
  'nYp>/J', '.Gj$h1', 'x$xHb3',
  '?{4zhv', 'sKKsLB', 'MVfAOG',
  '&wDoY7', 'sQ@CHF'
]

```
