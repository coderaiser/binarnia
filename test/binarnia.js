'use strict';

const test = require('supertape');
const binarnia = require('..');

test('binarnia: no args', (t) => {
    t.throws(binarnia, /schema should be an array!/, 'should throw when no args');
    t.end();
});

test('binarnia: no buffer', (t) => {
    const fn = () => binarnia([]);
    t.throws(fn, /buffer should be buffer or an array!/, 'should throw when no buffer');
    t.end();
});

test('binarnia: value', (t) => {
    const schema = [{
        offset: '0x00',
        name: 'format',
        length: 1,
        type: 'value',
    }];
    
    const buffer = [0x33];
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: '0x33'
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: array', (t) => {
    const schema = [{
        offset: '0x00',
        name: 'format',
        length: 1,
        type: 'array',
        array: [
            'MZ',
            'PE',
        ]
    }];
    
    const buffer = [0x00];
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: 'MZ'
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: enum', (t) => {
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
    
    const buffer = [0x22];
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: 'MZ'
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: enum: not found', (t) => {
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
    
    const buffer = [0x44];
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: '0x44'
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: bit', (t) => {
    const schema = [{
        offset: '0x00',
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
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: ['MZ', 'PE'],
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: bit: direct', (t) => {
    const schema = [{
        offset: '0x00',
        name: 'format',
        length: 1,
        type: 'bit',
        bit: {
            '0x1': 'MZ',
            '0x2': 'PE',
        }
    }];
    
    const buffer = [0x02];
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: ['PE'],
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: LE', (t) => {
    const schema = [{
        offset: '0x00',
        name: 'format',
        length: 4,
        type: 'value',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const result = binarnia(schema, buffer);
    const expected = {
        format: '0x4030201'
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: BE', (t) => {
    const schema = [{
        offset: '0x00',
        name: 'format',
        length: 4,
        type: 'value',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const result = binarnia(schema, 'BE', buffer);
    const expected = {
        format: '0x1020304'
    };
    
    t.deepEqual(result, expected, 'should equal');
    t.end();
});

test('binarnia: not defined', (t) => {
    const schema = [{
        offset: '0x00',
        name: 'format',
        length: 4,
        type: 'super',
    }];
    
    const buffer = [0x01, 0x02, 0x03, 0x04];
    
    const fn = () => binarnia(schema, 'BE', buffer);
    t.throws(fn, /0x00: format: behaviour of type "super" is not defined/, 'should throw');
    
    t.end();
});
