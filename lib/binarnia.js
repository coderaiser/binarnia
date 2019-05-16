'use strict';

const currify = require('currify');
const {
    readUIntLE,
    readUIntBE,
} = require('read-uint');

module.exports = (options) => {
    checkOptions(options);
    
    const {
        schema,
        buffer,
        offset = '0x0',
        endian = 'LE',
    } = options;
    
    check(offset, schema, endian, buffer);
    
    const readHex = getReadHex(endian);
    const result = {};
    
    let currentOffset = parseOffset(offset);
    
    for (const item of schema) {
        const {
            offset,
            type,
            name,
            size,
        } = item;
        
        const itemOffset = parseOffset(offset);
        const parsedSize = parseSize(size, result);
        const resultOffset = itemOffset || currentOffset;
        
        const value = readHex(buffer, resultOffset, parsedSize);
        
        currentOffset += parsedSize;
        
        if (type === 'enum') {
            result[name] = item.enum[value] || value;
            continue;
        }
        
        if (type === 'array') {
            result[name] = item.array[parseInt(value, 16)];
            continue;
        }
        
        if (type === 'value') {
            result[name] = value;
            continue;
        }
        
        if (type === 'string') {
            result[name] = parseString(value, endian);
            continue;
        }
        
        if (type === 'bit') {
            result[name] = parseBit(item, value);
            continue;
        }
        
        throw Error(`0x${resultOffset.toString(16)}: ${name}: behaviour of type "${type}" is not defined`);
    }
    
    return result;
};

module.exports.sizeof = require('./sizeof');

function parseOffset(offset) {
    if (typeof offset !== 'string')
        return offset;
    
    return parseInt(offset, 16);
}

function parseSize(size, result) {
    if (typeof size === 'number')
        return size;
    
    const name = size.replace(/[<>]/g, '');
    return parseInt(result[name], 16);
}

function parseBit(item, value) {
    const firstResult = item.bit[value];
    
    if (firstResult)
        return [firstResult];
    
    const bits = Object.keys(item.bit);
    
    const result = [];
    const numberValue = parseInt(value, 16);
    
    for (const bit of bits) {
        const number = parseInt(bit, 16);
        
        if (!(number & numberValue))
            continue;
        
        result.push(item.bit[bit]);
    }
    
    return result;
}

const convertCodeToChar = (result, hex) => (i) => {
    const number = hex.substr(i, 2);
    const code = parseInt(number, 16);
    const str = String.fromCharCode(code);
    
    result.push(str);
};

function parseString(hex, endian) {
    const n = hex.length;
    const result = [];
    const start = '0x'.length;
    const convert = convertCodeToChar(result, hex);
    
    if (endian === 'BE')
        for (let i = start; i < n; i += 2)
            convert(i);
    else
        for (let i = n - start; i > 0; i -= 2)
            convert(i);
    
    return result.join('');
}

const getReadHex = currify((endian, buffer, offset, length) => {
    if (endian === 'LE')
        return readUIntLE(buffer, offset, length);
    
    return readUIntBE(buffer, offset, length);
});

function checkOptions(options) {
    if (typeof options !== 'object')
        throw Error('options should be an object!');
}

function check(offset, schema, endian, buffer) {
    const isBufferExist = typeof Buffer !== 'undefined';
    const isBuffer = isBufferExist && buffer instanceof Buffer;
    const isArray = Array.isArray(buffer);
    
    if (typeof offset !== 'string' && isNaN(offset))
        throw Error('offset should be number or string!');
    
    if (!Array.isArray(schema))
        throw Error('schema should be an array!');
    
    if (!isBuffer && !isArray)
        throw Error('buffer should be buffer or an array!');
}

