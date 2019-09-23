'use strict';

const toNumber = (a) => Number(a) || 0;
const sumSizes = (a, b) => a + toNumber(b.size);

module.exports = (schema) => {
    check(schema);
    
    return schema.reduce(sumSizes, 0);
};

function check(schema) {
    if (!Array.isArray(schema))
        throw Error('schema should be an array!');
}

