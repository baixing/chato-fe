<h1 align="center">
  <a href="https://chato.cn/">
    <img width="120" height="24" src="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/avater/87e2bb817371b4aec6cbe549ac58e62e.png" alt="Chato">
  </a>
</h1>

<p align="center">基于知识库轻松定制专属助理机器人</p>

<p align="center">官网：<a href="https://chato.cn/" target="_blank">https://chato.cn</a></p>

## 简介

[Chato FE](https://github.com/baixing/chato-fe) 是一套基于 LLM 与用户私有文档进行训练定制化 AI 机器人的开源解决方案，它使用了最新的前端技术栈，并包含了典型的网站业务功能。包括首页、登录注册、权限校验、文档与问答训练、机器人配置、聊天对话等功能，它可以帮助您快速搭建完整的前后台 AI 聊天网站，帮您节约前端页面功能需求的研发时间。

<p align="center">
<img width="709" height="395" src="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/avater/ab6795735a2c999eeff4c7e2f22e0337.png" alt="Chato-tranning">
</p>

## 特性

- 😎 **模型支持**：支持 ChatGLM、MiniMax、文心一言、GPT 等多种 LLM 模型。
- 📝 **编排 Prompt**：通过界面化编写 prompt 或 AI 创建 prompt，进行聊天调试，只需几分钟即可发布一个专属 AI 机器人。
- 💬 **聊天对话**：SSE 流式聊天，支持语音识别、语音播报、回答翻译等功能。
- 🖌️ **绘画支持**：接入 MidJourney，解锁 AI 绘画能力。
- 🗃️ **开箱即用**：配置好的后端服务，开箱即用的 Web 站点，亦可支持使用您自己的本地服务。
- 🌍 **国际化**：支持多语言和本土化特性。
- 📱 **响应式**：响应式布局，在无线和 PC 端都可以友好展现。
- 🔥 **最新技术**：使用 `Vue3`、`TypeScript`、`Pinia`、`Vite` 等前端前沿技术。

## 准备

- [node](http://nodejs.org/) 和 [git](https://git-scm.com/) - 项目开发环境
- [Vite](https://vitejs.dev/) - 熟悉 `Vite` 特性
- [Vue3](https://v3.vuejs.org/) - 熟悉 `Vue` 基础语法
- [TypeScript](https://www.typescriptlang.org/) - 熟悉 `TypeScript` 基本语法
- [ES6+](http://es6.ruanyifeng.com/) - 熟悉 `ES6` 基本语法
- [Vue-Router-Next](https://next.router.vuejs.org/) - 熟悉 `Vue Router` 基本使用
- [Element Plus](https://github.com/element-plus/element-plus) - ui 基本使用

## 使用

- 获取项目代码

```bash
git clone https://github.com/baixing/chato-fe.git
```

- 安装依赖

```bash
cd chato-fe

yarn install
```

- 运行

```bash
yarn dev
```

- 打包

```bash
yarn build
```

## 更新日志

[CHANGELOG](./CHANGELOG.md)

## 如何贡献

非常欢迎你的加入！[提一个 Issue](https://github.com/baixing/chato-fe/issues) 或者提交一个 Pull Request。

**Pull Request:**

1. Fork 代码!
2. 创建自己的分支: `git checkout -b feat/xxxx`
3. 提交你的修改: `git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支: `git push origin feat/xxxx`
5. 提交 `pull request`

## Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

## 浏览器支持

本地开发推荐使用 `Chrome 80+` 浏览器

支持现代浏览器

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                                            last 2 versions                                                                                             |                                                                                                  last 2 versions                                                                                                  |                                                                                                last 2 versions                                                                                                |                                                                                                last 2 versions                                                                                                |

## Contributors

感谢所有为 Chato FE 做出贡献的人！

<a href="https://github.com/baixing/chato-fe/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=baixing/chato-fe" />
</a>

## License

[Apache](https://github.com/baixing/chato-fe/master/LICENSE)
