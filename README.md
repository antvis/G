# G

## 开发

使用 lerna 进行多模块的管理和开发，所有的模块都在 `packages` 目录中，每个模块都是独立的 npm 包，并且解决了各个包之间依赖本地开发文件的问题。

使用的基本操作为:

- 安装依赖

```bash
npm i
npx lerna bootstrap
```

- link

通过 link 操作，可以将包之间的依赖改成依赖为本地开发的文件。

```bash
npx lerna link
```

- run

可以通过这个命令批量跑 `scripts`。例如:

```bash
npx lerna run test
npx lerna run build
```

- publish

```bash
npm run pre-publish  # 执行发布前脚本
npm run publish      # 发布正式版本
# or
npm run publish-beta # 发布 beta 版本
```

- clean

批量清空 packages 的 node_modules 目录！

```bash
npx lerna clean
```

以上命令基本够用，深度用户参考其他命令：[lerna](https://github.com/lerna/lerna)。
