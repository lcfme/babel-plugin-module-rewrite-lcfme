const babel = require('@babel/core');
const pluginFunc = require('./src/index');

const code = `
require.a('a');
`;

babel.transform(code, {
  plugins: [[pluginFunc, { replaceFunction: './replaceFunction.js', a: 'aa' }]]
});
