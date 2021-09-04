module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  globals: {
    window: 'readonly',
    document: 'readonly',
    Web3: 'readonly',
    alert: 'readonly',
    fetch: 'readonly'
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never']
  }
}
