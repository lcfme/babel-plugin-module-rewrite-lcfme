const babel = require('@babel/core');
const pluginFunc = require('../src/index');

const code = `
require('a');
require('b');
`;

const result = babel.transform(code, {
    plugins: [
        [
            pluginFunc,
            { replaceFunction: __dirname + '/replaceFunction.js', a: 'aa' }
        ]
    ]
});

console.log(result.code);
