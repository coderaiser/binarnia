'use strict';

const test = require('supertape');
const tryCatch = require('try-catch');
const binarnia = require('..');

test('binarnia: no args', (t) => {
    const [e] = tryCatch(binarnia);
    
    t.equal(e.message, 'options should be an object!', 'should throw when no options');
    t.end();
});

test('binarnia: no schema', (t) => {
    const [e] = tryCatch(binarnia, {});
    
    t.equal(e.message, 'schema should be an array!', 'should throw when no args');
    t.end();
});

test('binarnia: bad offset', (t) => {
    const [e] = tryCatch(binarnia, {
        offset: {},
    });
    
    t.equal(e.message, 'offset should be number or string!', 'should throw when no args');
    t.end();
});

test('binarnia: no buffer', (t) => {
    const schema = [];
    const [e] = tryCatch(binarnia, {
        schema,
    });
    
    t.equal(e.message, 'buffer should be buffer or an array!', 'should throw when no buffer');
    t.end();
});

test('binarnia: value', (t) => {
    const schema = [{
        name: 'format',
        size: 1,
        type: 'value',
    }];
    
    const buffer = [0x33];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: '0x33',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: string', (t) => {
    const schema = [{
        name: 'message',
        size: 5,
        type: 'string',
    }];
    
    const buffer = [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x27, 0x00];
    
    const result = binarnia({
        schema,
        endian: 'BE',
        buffer,
    });
    
    const expected = {
        message: 'hello',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: string: LE', (t) => {
    const schema = [{
        name: 'message',
        size: 5,
        type: 'string',
    }];
    
    const buffer = [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x27, 0x00];
    
    const result = binarnia({
        schema,
        buffer,
    });
    
    const expected = {
        message: 'hello',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: array', (t) => {
    const schema = [{
        name: 'format',
        size: 1,
        type: 'array',
        array: [
            'MZ',
            'PE',
        ],
    }];
    
    const buffer = [0x00];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: 'MZ',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: enum', (t) => {
    const schema = [{
        name: 'format',
        size: 1,
        type: 'enum',
        enum: {
            '0x22': 'MZ',
            '0x33': 'PE',
        },
    }];
    
    const buffer = [0x22];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: 'MZ',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: enum: not found', (t) => {
    const schema = [{
        name: 'format',
        size: 1,
        type: 'enum',
        enum: {
            '0x22': 'MZ',
            '0x33': 'PE',
        },
    }];
    
    const buffer = [0x44];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: '0x44',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: bit', (t) => {
    const schema = [{
        name: 'format',
        size: 1,
        type: 'bit',
        bit: {
            '0x1': 'MZ',
            '0x2': 'PE',
            '0x4': 'ELF',
        },
    }];
    
    const buffer = [0x03];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: ['MZ', 'PE'],
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: bit: direct', (t) => {
    const schema = [{
        name: 'format',
        size: 1,
        type: 'bit',
        bit: {
            '0x1': 'MZ',
            '0x2': 'PE',
        },
    }];
    
    const buffer = [0x02];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: ['PE'],
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: LE', (t) => {
    const schema = [{
        name: 'format',
        size: 4,
        type: 'value',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: '0x4030201',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: ignore', (t) => {
    const schema = [{
        name: 'format',
        size: 2,
        type: 'value',
    }, {
        name: 'reserved',
        size: 2,
        type: 'ignore',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const result = binarnia({schema, buffer});
    const expected = {
        format: '0x201',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: link to size', (t) => {
    const schema = [{
        name: 'label_size',
        size: 1,
        type: 'value',
    }, {
        name: 'label',
        size: '<label_size>',
        type: 'string',
    }];
    
    const buffer = [0x03, 0x31, 0x32, 0x33];
    
    const result = binarnia({schema, buffer});
    const expected = {
        label_size: '0x3',
        label: '123',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: BE', (t) => {
    const schema = [{
        name: 'format',
        size: 4,
        type: 'value',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const result = binarnia({
        schema,
        endian: 'BE',
        buffer,
    });
    
    const expected = {
        format: '0x1020304',
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: not defined', (t) => {
    const schema = [{
        offset: '0x0',
        name: 'format',
        size: 4,
        type: 'super',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const fn = () => binarnia({
        schema,
        buffer,
        endian: 'BE',
    });
    
    t.throws(fn, /0x0: format: behaviour of type "super" is not defined/, 'should throw');
    t.end();
});

test('binarnia: sizeof', (t) => {
    const result = binarnia.sizeof([{
        name: 'a',
        size: 4,
        type: 'value',
    }, {
        name: 'b',
        size: 4,
        type: 'value',
    }]);
    
    const expected = 8;
    
    t.equal(result, expected);
    t.end();
});

test('binarnia: sizeof: links', (t) => {
    const result = binarnia.sizeof([{
        name: 'size',
        size: 4,
        type: 'value',
    }, {
        name: 'b',
        size: '<size>',
        type: 'value',
    }]);
    
    const expected = 4;
    
    t.equal(result, expected);
    t.end();
});

test('binarnia: sizeof: no args', (t) => {
    const [e] = tryCatch(binarnia.sizeof);
    
    t.equal(e.message, 'schema should be an array!');
    t.end();
});

