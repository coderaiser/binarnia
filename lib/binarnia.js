'use strict';

const currify = require('currify');

const {readUIntLE, readUIntBE} = require('read-uint');
const {transform} = require('./transformer');

const isString = (a) => typeof a === 'string';
const isNumber = (a) => typeof a === 'number';

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
        
        transform(result, {
            name,
            type,
            item,
            value,
            endian,
            resultOffset,
        });
    }
    
    return result;
};

module.exports.sizeof = require('./sizeof');

function parseOffset(offset) {
    if (!isString(offset))
        return offset;
    
    return parseInt(offset, 16);
}

function parseSize(size, result) {
    if (isNumber(size))
        return size;
    
    const name = size.replace(/[<>]/g, '');
    
    return parseInt(result[name], 16);
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
    
    if (!isString(offset) && isNaN(offset))
        throw Error('offset should be number or string!');
    
    if (!Array.isArray(schema))
        throw Error('schema should be an array!');
    
    if (!isBuffer && !isArray)
        throw Error('buffer should be buffer or an array!');
    
    if (endian !== 'LE' && endian !== 'BE')
        throw Error(`endian should be 'BE' or 'LE', received: '${endian}'`);
}
