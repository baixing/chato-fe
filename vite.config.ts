import BasicSSL from '@vitejs/plugin-basic-ssl'
import legacy from '@vitejs/plugin-legacy'
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import { resolve } from "path"
import AutoImport from "unplugin-auto-import/vite"
import ElementPlus from "unplugin-element-plus/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig, loadEnv } from "vite"
import eslintPlugin from 'vite-plugin-eslint'
import { prismjsPlugin } from 'vite-plugin-prismjs'
import type { ViteSentryPluginOptions } from 'vite-plugin-sentry'
import viteSentry from 'vite-plugin-sentry'
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import buildConfig from "./plugins/build-id"

// import { visualizer } from "rollup-plugin-visualizer"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const devWithHttps = Boolean(env?.HTTPS || false)
  const isProd = env.VITE_APP_ENV === 'prod'

  const sentryConfig: ViteSentryPluginOptions = {
    authToken: env.VITE_APP_SENTRY_TOKEN,
    url: env.VITE_APP_SENTRY_URL,
    org: env.VITE_APP_SENTRY_ORG,
    project: env.VITE_APP_SENTRY_PROJECT,
    release: '1.0', // TODO: package.json version 保持同步
    deploy: {
      env: 'production',
    },
    skipEnvironmentCheck: true, // 可以跳过环境检查
    cleanSourcemapsAfterUpload: true,
    sourceMaps: {
      include: ['./dist/assets'],
      ignore: ['node_modules'],
      urlPrefix: '~/assets',
    },
  }

  return {
    server: {
      port: 8001,
      https: devWithHttps,
      open: true,
      host: true
    },
    plugins: [
      vue(),
      devWithHttps && BasicSSL(),
      // 按需引入，主题色的配置，需要加上 importStyle: 'sass'
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      ElementPlus({
        useSource: true,
      }),
      // 注入svg
      createSvgIconsPlugin({
        // 配置svg文件路径
        iconDirs: [resolve(process.cwd(), "src/assets/icons")],
        // 指定symbolId格式，规则
        symbolId: "icon-[dir]-[name]",
      }),
      buildConfig(),
      eslintPlugin({
        include: ['src/**/*.ts', 'src/**/*.vue', 'src/*.ts', 'src/*.vue']
      }),
      prismjsPlugin({
        languages: 'all',
        theme: 'okaidia',
        css: true,
      }),
      legacy({
        targets: ['chrome < 60', 'edge < 15'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: [
          'es.symbol',
          'es.array.filter',
          'es.promise',
          'es.promise.finally',
          'es/map',
          'es/set',
          'es.array.for-each',
          'es.object.define-properties',
          'es.object.define-property',
          'es.object.get-own-property-descriptor',
          'es.object.get-own-property-descriptors',
          'es.object.keys',
          'es.object.to-string',
          'web.dom-collections.for-each',
          'esnext.global-this',
          'esnext.string.match-all'
        ]
      }),
      isProd ? viteSentry(sentryConfig) : null,
      // visualizer({
      //   open: true,  //注意这里要设置为true，否则无效
      //   filename: "stats.html", //分析图生成的文件名
      //   gzipSize: true, // 收集 gzip 大小并将其显示
      //   brotliSize: true, // 收集 brotli 大小并将其显示
      // })
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;',
        },
      },
    },
    base: "/",
    build: {
      sourcemap: isProd,
      target: "modules",
      emptyOutDir: true,
      outDir: "dist",
      cssCodeSplit: true,
      minify: "terser",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html"),
          iframe: resolve(__dirname, "src/build/iframe.ts"),
        },
        output: {
          chunkFileNames: "assets/[name].[hash].js", // 打包出来的chunk文件名
          entryFileNames: (chunkInfo: any) =>
            chunkInfo.name.includes("iframe") ? "assets/iframe.min.js" : "assets/[name].[hash].js", // 入口文件名打包出来文件名
          assetFileNames: "assets/[ext]/[name].[hash].[ext]",
          manualChunks: {
            "markdown-it": ["markdown-it"],
            "markdown-it-highlightjs": ["markdown-it-highlightjs"],
            "wow.js": ["wow.js"],
            lodash: ['lodash']
          },
        },
      },
    },
  }
})
