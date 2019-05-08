# Binarnia [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage][CoverageIMGURL]][CoverageURL]

Parse binary buffer to json according to schema.

## Install

```
npm i binarnia
```

## How to use?

```js
const binarnia = require('binarnia');
const schema = [{
    offset: '0x01',
    name: 'arch',
    length: 1,
    type: 'value',
}];

const buffer = Buffer.from([0x22]);

// endianness = 'LE'
binarnia({schema, buffer});
// returns
{
    arch: '0x22',
};

// directly pass endianness
binarnia({
    schema,
    endian: 'BE',
    buffer,
});
// returns
{
    arch: '0x22',
};

const array = [0x22];
// works with array as well

binarnia({
    schema,
    endian: 'BE',
    buffer: array
});
// returns
{
    arch: 'x22',
};
```

### Value

```js
const schema = [{
    offset: '0x00',
    name: 'format',
    length: 1,
    type: 'value',
}];

const buffer = [0x03];

binarnia({schema, buffer});
// returns
{
    format: '0x03'
}
```

### String

```js
const schema = [{
    offset: '0x00',
    name: 'message',
    length: 5,
    type: 'string',
}];

const buffer = [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x27, 0x00];

binarnia({
    schema,
    endian: 'BE',
    buffer
});
// returns
{
    message: 'hello'
}
```

### Bit

```js
const schema = [{
    name: 'format',
    length: 1,
    type: 'bit',
    bit: {
        '0x1': 'MZ',
        '0x2': 'PE',
        '0x4': 'ELF',
    }
}];

const buffer = [0x03];

const result = binarnia({
    offset: '0x00',
    schema,
    buffer,
});
// returns
{
    format: ['MZ', 'PE'],
}
```

### Enum

```js
const binarnia = require('binarnia');
const schema = [{
    offset: '0x00',
    name: 'format',
    length: 1,
    type: 'enum',
    enum: {
        '0x22': 'MZ',
        '0x33': 'PE',
    }
}];

const buffer = Buffero.from([0x22, 0x01]);

binarnia({schema, buffer});
// returns
{
    format: 'MZ'
};
```

### Links
const schema = [{
    name: 'msg_size',
    length: 1,
    type: 'value',
}, {
    name: 'msg',
    length: '<msg_size>',
    type: 'string'
}];

const buffer = [0x1, 0x31];

binarnia({schema, buffer});
// returns
{
    msg_size: '0x01',
    msg: '1'
}
```

### Array

```js
const binarnia = require('binarnia');
const schema = [{
    offset: '0x01',
    name: 'arch',
    length: 1,
    type: 'array',
    array: [
        'x32',
        'x64',
    ]
}];

const buffer = Buffero.from([0x22, 0x01]);

binarnia({schema, buffer});
// returns
{
    arch: 'x32',
};
```

## Environments

In old `node.js` environments that not fully supports `es2015`, `binarnia` could be used with:

```js
var binarnia = require('binarnia/legacy');
```

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/binarnia.svg?style=flat&longCache=true
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/binarnia/master.svg?style=flat&longCache=true
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/binarnia.svg?style=flat&longCache=true
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat&longCache=true
[NPMURL]:                   https://npmjs.org/package/binarnia 'npm'
[BuildStatusURL]:           https://travis-ci.org/coderaiser/binarnia  'Build Status'
[DependencyStatusURL]:      https://david-dm.org/coderaiser/binarnia 'Dependency Status'
[LicenseURL]:               https://tldrlegal.com/license/mit-license 'MIT License'

[CoverageURL]:              https://coveralls.io/github/coderaiser/binarnia?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/binarnia/badge.svg?branch=master&service=github

