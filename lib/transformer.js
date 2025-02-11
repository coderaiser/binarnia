'use strict';

const parsers = {
    enum: parseEnum,
    array: parseArray,
    value: parseValue,
    string: parseString,
    bit: parseBit,
    decimal: parseDecimal,
};

module.exports.transform = (result, {name, item, type, value, resultOffset, endian}) => {
    const parse = parsers[type];
    
    if (type === 'ignore')
        return;
    
    if (!parse)
        throw Error(`0x${resultOffset.toString(16)}: ${name}: behaviour of type "${type}" is not defined`);
    
    result[name] = parse({
        item,
        value,
        endian,
        resultOffset,
    });
};

function parseEnum({item, value}) {
    return item.enum[value] || value;
}

function parseArray({item, value}) {
    return item.array[parseInt(value, 16)];
}

function parseDecimal({value}) {
    return parseInt(value, 16);
}

function parseValue({value}) {
    return value;
}

function parseString({value, endian}) {
    const n = value.length;
    const result = [];
    const start = '0x'.length;
    const convert = convertCodeToChar(result, value);
    
    if (endian === 'BE')
        for (let i = start; i < n; i += 2)
            convert(i);
    else
        for (let i = n - start; i > 0; i -= 2)
            convert(i);
    
    return result.join('');
}

const convertCodeToChar = (result, hex) => (i) => {
    const number = hex.substr(i, 2);
    const code = parseInt(number, 16);
    const str = String.fromCharCode(code);
    
    result.push(str);
};

function parseBit({item, value}) {
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
