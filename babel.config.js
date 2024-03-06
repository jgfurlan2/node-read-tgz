const path = require('node:path')

const alias = {
  '~': './src'
}

module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], ['@babel/preset-typescript']],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['module-resolver', { cwd: path.resolve(__dirname), alias }]
  ],
  ignore: ['**/*.d.ts']
}
