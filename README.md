# Util

> 所有 Util 模块


## Lerna

使用 lerna 进行多模块的管理和开发，所有的模块都在 `packages` 目录中，每个模块都是独立的 npm 包，并且解决了各个包之间依赖本地开发文件的问题。


使用的基本操作为：

- 安装依赖
 
```bash
tnpm i
npx lerna bootstrap
```


- link

通过 link 操作，可以将包之间的依赖改成依赖为本地开发的文件。

```bash
npx lerna link
```

- run (test、build...)

可以通过这个命令批量跑 `scripts`。例如：

```bash
npx lerna run test
npx lerna run build
```

- publish

批量 publish。

- clean

批量清空 packages 的 node_modules 目录！

```bash
npx lerna clean
```


以上命令基本够用，深度用户参考其他命令：[lerna](https://github.com/lerna/lerna)。

## Principles

- 尽量统一编译、工具链，保证版本一致，比如：babel、typescript、jest 等，各个 packages 尽量使用统一的版本，并将依赖写到根目录 package.json。
- tsconfig.json 需要 extends 根目录配置，各模块的特性化配置自己管理。
- 模块需要有单测覆盖。
- 相同规范的 `scripts`：
   - start
   - test
   - build
- 增加 .npmignore，去除源码，仅保留编译压缩之后的包。
- 统一 lint 配置。
- README.md 模块需要清晰展现模块的 API 和主路径使用示例。

<!-- GITCONTRIBUTOR_START -->

<!-- GITCONTRIBUTOR_END -->
