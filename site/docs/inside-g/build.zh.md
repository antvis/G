---
title: 构建说明
order: 1
---

# 依赖关系

在目前 monorep 中，各个包的依赖关系如下：

-   `@antv/g` 核心包，依赖注入使用 mana-syringe
-   `@antv/g-canvas/svg/webgl` 渲染器包，依赖 `@antv/g`，内部注册了一系列插件：
    -   例如 `@antv/g-canvas` 依赖 `@antv/g-plugin-canvas-renderer` 等四个插件
-   `@antv/g-plugin-xxx` 插件包，依赖 `@antv/g`，部分插件也会依赖其他插件

特别的，`g-webgl` 使用 wasm 转译 GLSL 到 WGSL。

在构建时我们选择 [father](https://github.com/umijs/father) 构建 CJS 与 ESM，webpack4 构建 UMD。

# CJS 与 ESM

构建时使用 father：

```json
// 根目录 package.json
"build": "father build",
```

在 `fatherrc` 中选择 `babel` 模式：

```js
{
  cjs: 'babel',
  esm: 'babel',
  umd: false,
  nodeResolveOpts: {
    mainFields: ['module', 'browser', 'main'],
  },
  pkgs: [
    'g-math',
    // 省略其他构建包
  ]
}
```

运行后在每个子包下 `/es` 和 `/lib` 下就会生成对应源文件的 ESM 和 CJS 文件了。

# UMD

使用 webpack4 构建 UMD，以 `g-canvas` 为例，在配置文件中排除掉：

```js
module.exports = {
    ...common,
    externals: {
        '@antv/g': {
            commonjs: '@antv/g',
            commonjs2: '@antv/g',
            amd: '@antv/g',
            root: 'G', // 运行时通过 window.G 获取
        },
        'mana-syringe': {
            commonjs: 'mana-syringe',
            commonjs2: 'mana-syringe',
            amd: 'mana-syringe',
            root: ['G', 'ManaSyringe'], // 运行时通过 window.G.ManaSyringe 获取
        },
    },
    output: {
        library: ['G', 'Canvas2D'], // 暴露 window.G.Canvas2D
        libraryTarget: 'umd',
        filename: 'index.umd.min.js',
    },
};
```

# WASM

特别的 `g-webgl` 需要使用 WASM，因此多加一个插件：

```js
plugins: [
    new WasmPackPlugin({
        crateDirectory: path.join(__dirname, 'rust'), // crate 放在 /rust 下
        forceMode: 'production',
    }),
],
```
