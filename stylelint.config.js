module.exports = {
  // 此文件更改后, 需npm run dev 才能生效
  defaultSeverity: 'error',
  extends: ['stylelint-config-standard'], // 使用标准规则
  plugins: ['stylelint-scss', 'stylelint-less'], // 要规范scss或less的话，要加插件
  rules: {
    // 规则地址：https://stylelint.docschina.org/user-guide/rules/
    'at-rule-empty-line-before': [
      // 指定了在规则之前要求空行
      // 'always' 表示始终要求空行，except: ['first-nested'] 表示除了第一个嵌套规则之外，ignore: ['after-comment'] 表示忽略注释之后的空行。
      'always',
      {
        ignore: ['after-comment'],
        ignoreAtRules: ['apply']
      }
    ], // 必须要有空行, 关闭
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-single-line-comment']
      }
    ],
    'at-rule-no-unknown': null, // 某些语法识别不了, 比如 for循环
    'number-leading-zero': null, // .1 和 0.1 同时支持
    'no-descending-specificity': null, // 禁止在具有较高优先级的选择器后出现被其覆盖的较低优先级的选择器
    'declaration-block-trailing-semicolon': false, // 要求或禁止声明块的一个尾随分号（可自动修复）
    'font-family-no-missing-generic-family-keyword': null // 关闭: 禁止在字体族名称列表中缺少通用字体族关键字。
  },
  overrides: [
    {
      files: ['*.css', '*.scss', '*.less', '*.vue', '*.html'],
      options: {
        rules: {
          indentation: 2 // 使用两个空格进行缩进
        }
      }
    }
  ]
}
