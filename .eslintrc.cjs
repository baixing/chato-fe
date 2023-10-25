module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:prettier/recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    semi: ['error', 'never'], // 禁止使用分号
    'vue/multi-word-component-names': 'off',
    // 解决 ESLint 和 Prettier 的 switch/case 缩进冲突
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-unused-vars': 'off',
    // vite 打包时自动去除 console 和 debugger, 所以这里直接关掉检查
    'no-console': 'off',
    'no-debugger': 'off',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-useless-escape': 'off',
    'no-async-promise-executor': 'off',
  },
  ignorePatterns: [
    // 'index.html',
    'dist/',
    '_sandbox/'
  ]
}
