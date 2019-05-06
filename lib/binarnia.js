'use strict';

const currify = require('currify');
const {
    readUIntLE,
    readUIntBE,
} = require('read-uint');

module.exports = (schema, endian, buffer) => {
    if (!buffer) {
        buffer = endian;
        endian = 'LE';
    }
    
    check(schema, endian, buffer);
    
    const readHex = getReadHex(endian);
    const result = {};
    
    for (const item of schema) {
        const {
            type,
            name,
            offset,
            length,
        } = item;
        
        const offsetNumber = parseInt(offset, 16);
        const value = readHex(buffer, offsetNumber, length);
        
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
        
        throw Error(`${offset}: ${name}: behaviour of type "${type}" is not defined`);
    }
    
    return result;
};

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
    const str = String.fromCharCode(code)
    
    result.push(str);
}

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

function check(schema, endian, buffer) {
    const isBufferExist = typeof Buffer !== 'undefined';
    const isBuffer = isBufferExist && buffer instanceof Buffer;
    const isArray = Array.isArray(buffer);
    
    if (!Array.isArray(schema))
        throw Error('schema should be an array!');
    
    if (!isBuffer && !isArray)
        throw Error('buffer should be buffer or an array!');
}

