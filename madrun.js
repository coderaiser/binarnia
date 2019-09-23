'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape test/*.js',
    'coverage': () => 'nyc npm test',
    'lint': () => 'putout lib test madrun.js',
    'fix:lint': () => run('putout', '--fix'),
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    'build': () => run(['clean', '6to5', 'legacy:*']),
    '6to5': () => 'babel -d legacy/lib lib',
    'wisdom': () => run('build'),
    'clean': () => 'rimraf legacy/*',
    'watcher': () => 'nodemon -w test -w lib --exec',
    'watch:test': () => run('watcher', 'npm test'),
    'watch:lint': () => run('watcher', '\'npm run lint\''),
    'watch:tape': () => 'nodemon -w test -w lib --exec tape',
    'watch:coverage:base': () => run('watcher', 'nyc npm test'),
    'watch:coverage:tape': () => run('watcher', 'nyc tape'),
    'watch:coverage': () => run('watch:coverage:base'),
    'legacy:index': () => 'echo "module.exports = require(\'./lib/binarnia\');" > legacy/index.js',
};

