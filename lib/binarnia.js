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
            result[name] = item.enum[value];
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
        
        throw Error(`${offset}: ${name}: behaviour of type "${type}" is not defined`);
    }
    
    return result;
};

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

