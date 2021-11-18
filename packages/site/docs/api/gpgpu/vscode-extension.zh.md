---
title: VS Code 扩展
order: 5
---

虽然开发者可以使用 [TypeScript 语法](/zh/docs/api/syntax)实现自己的 Shader 计算逻辑，但在字符串中写程序体验肯定是不好的，在缺少语法高亮、智能提示的情况下很容易出现错误，例如：

```typescript
const compute = world.createComputePipeline({
    shader: `
  import { debug } from 'g-webgpu';
  
  // 拼写错误 classs -> class
  classs MyProgram {
    //...
  }
  `,
    dispatch: [1, 1, 1],
    onCompleted: (result) => {},
});
```

为此我们发布了一个简单的 [VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=xiaoiver-antfin.vscode-gwebgpu)，对于 `.g` 后缀的文件提供语法特性支持。目前仅支持语法高亮，后续会支持更多编程类特性。

![image](https://user-images.githubusercontent.com/3608471/84572140-ab782c00-adca-11ea-9e17-3e8b6815c742.png)

在项目中使用该扩展的方法很简单：

1. 安装扩展
2. 创建 `.g` 文件，使用 TypeScript 语法写计算逻辑
3. 在构建工具中以字符串形式引入 `.g` 文件内容

## 安装扩展

在 VS Code 扩展市场中搜索 `gwebgpu` 即可： ![image](https://user-images.githubusercontent.com/3608471/84572053-137a4280-adca-11ea-8a35-6185492e45d0.png)

安装完成之后，创建 `.g` 文件就可以开始编写计算程序了。

## 以字符串形式引入

我们希望可以以字符串形式直接引用 `.g` 文件内容：

```typescript
import myShader from 'my-program.g';

const compute = world.createComputePipeline({
    shader: myShader,
    dispatch: [1, 1, 1],
    onCompleted: (result) => {},
});
```

这取决于项目使用的构建工具，下面我们以 Webpack 和 Babel 为例介绍如何使用。

### 使用 Webpack Loader

配置 [raw-loader](https://webpack.js.org/loaders/raw-loader/) 处理 `.g` 文件：

```javascript
// webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.g$/i,
                use: 'raw-loader',
            },
        ],
    },
};
```

### 使用 Babel 插件

在 Babel 中使用 [babel-plugin-inline-import](https://www.npmjs.com/package/babel-plugin-inline-import) 插件处理 `.g` 文件：

```javascript
// .babelrc
{
    "plugins": [
        ["babel-plugin-inline-import", {
            "extensions": [
                ".g"
            ]
        }]
    ]
}
```

## 更多语言特性

目前我们的插件仅支持配置式的语言特性，例如语法高亮。后续我们会支持自动补全、hover 展示文档等更多编程式语言特性。
