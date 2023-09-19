# 代码贡献规范

有任何疑问，欢迎提交 [issue](https://github.com/antvis/g/issues)，或者直接修改提交 [PR](https://github.com/antvis/g/pulls)!

## 提交 issue

- 请确定 issue 的类型。
- 请避免提交重复的 issue，在提交之前搜索现有的 issue。
- 在标签(分类参考**标签分类**), 标题 或者内容中体现明确的意图。

随后 AntV 负责人会确认 issue 意图，更新合适的标签，关联 milestone，指派开发者。

## 提交代码

### 提交 Pull Request

如果你有仓库的开发者权限，而且希望贡献代码，那么你可以创建分支修改代码提交 PR，AntV 开发团队会 review 代码合并到主干。

```bash
# 先创建开发分支开发，分支名应该有含义，避免使用 update、tmp 之类的
$ git checkout -b branch-name

# 开发完成后跑下测试是否通过，必要时需要新增或修改测试用例
$ npm test

# 测试通过后，提交代码，message 见下面的规范

$ git add . # git add -u 删除文件
$ git commit -m "fix(role): role.use must xxx"
$ git push origin branch-name
```

提交后就可以在 [G](https://github.com/antvis/g/pulls) 创建 Pull Request 了。

由于谁也无法保证过了多久之后还记得多少，为了后期回溯历史的方便，请在提交 MR 时确保提供了以下信息。

1. 需求点（一般关联 issue 或者注释都算）
2. 升级原因（不同于 issue，可以简要描述下为什么要处理）
3. 框架测试点（可以关联到测试文件，不用详细描述，关键点即可）
4. 关注点（针对用户而言，可以没有，一般是不兼容更新等，需要额外提示）

### 代码风格

你的代码风格必须通过 eslint，你可以运行 `$ npm run lint` 本地测试。

### Commit 提交规范

根据 [angular 规范](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format)提交 commit，这样 history 看起来更加清晰，还可以自动生成 changelog。

```xml
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

（1）type

提交 commit 的类型，包括以下几种

- feat: 新功能
- fix: 修复问题
- docs: 修改文档
- style: 修改代码格式，不影响代码逻辑
- refactor: 重构代码，理论上不影响现有功能
- perf: 提升性能
- test: 增加修改测试用例
- chore: 修改工具相关（包括但不限于文档、代码生成等）
- deps: 升级依赖

（2）scope

修改文件的范围

（3）subject

用一句话清楚的描述这次提交做了什么

（4）body

补充 subject，适当增加原因、目的等相关因素，也可不写。

（5）footer

- **当有非兼容修改(Breaking Change)时必须在这里描述清楚**
- 关联相关 issue，如 `Closes #1, Closes #2, #3`

示例

```bash
fix($compile): [BREAKING_CHANGE] couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Document change on antvis/g#12

Closes #392

BREAKING CHANGE:

  Breaks foo.bar api, foo.baz should be used instead
```

查看具体[文档](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit)

## 测试

G 基于 Jest 提供了两部分测试：

- **单元测试** [`__tests__/unit/`](./__tests__/unit/) 测试纯数据模块或者功能
- **集成测试** [`__tests__/integration/`](./__tests__/integration/) 基于 [node-canvas](https://github.com/Automattic/node-canvas)，[jsdom](https://github.com/jsdom/jsdom/) 和 [headless-gl](https://github.com/stackgl/headless-gl) 完成 `@antv/g-canvas`，`@antv/g-svg` 和 `@antv/g-webgl` 三个渲染器的服务端渲染，再进行截图对比

## 发布管理

G 使用 [pnpm workspace](https://pnpm.io/workspaces) 作为 monorepo 方案。各个包之间使用 [workspace 协议](https://pnpm.io/workspaces#workspace-protocol-workspace) 声明依赖版本号。在开发时 pnpm 会完成它们之间的 link，而在发布时会替换成固定的 semver 版本号。以 `@antv/g-plugin-dragndrop` 插件为例：

```json
// package.json
"dependencies": {
  "@antv/g-lite": "workspace:*"
},

// 发布后被替换成固定版本号
"dependencies": {
  "@antv/g-lite": "1.1.0"
},
```

这样很容易进行版本锁定。

### 全自动的语义化线上发布

参考 [S2 的工程化实践](https://www.yuque.com/antv/vo4vyz/vtowig#HuNvY)，我们使用了 [changesets](https://github.com/changesets/changesets) 进行全自动的语义化发布。它可以自动创建 GitHub Releases。

1. 从 next 分支拉出发布分支 release
2. 从 release 分支拉出各自的开发分支，开发完成后执行 changeset 并提交：

```bash
pnpm run changeset
git add ./
git commit -a -m "chore: commit changeset"
```

3. 将开发分支合入 release 分支，此时会触发 CI version 流程，自动生成 Version Package 的 PR，将此 PR 合入
4. 最后将 release 分支合并到 next 分支上，此时会触发 CI release 流程

另外所有 API 的废弃都需要在当前的稳定版本上 `deprecate` 提示，并保证在当前的稳定版本上一直兼容到新版本的发布。

### 如何锁定版本

在应急、或者测试 beta 版时常常需要锁定某些依赖版本，不同包管理工具锁定版本的方式不同。

tnpm 使用 `resolutions` 进行依赖覆盖。以 G2 为例，假如想测试一系列 beta 版本效果，可以这样做：

- 在 `dependencies` 中锁定**直接依赖**的版本号
- 在 `resolutions` 中锁定**间接依赖**的版本号。这样确保 G2 依赖的 `@antv/gui` 也使用同样的版本

```js
"dependencies": {
  "@antv/g": "5.17.0-beta.1",
  "@antv/g-canvas": "1.10.0-beta.1",
  "@antv/g-plugin-dragndrop": "1.7.0-beta.1",
},
"resolutions": {
  "@antv/g": "5.17.0-beta.1",
  "@antv/g-canvas": "1.10.0-beta.1",
  "@antv/g-svg": "1.9.0-beta.1",
  "@antv/g-plugin-dragndrop": "1.7.0-beta.1",
  "@antv/g-plugin-rough-canvas-renderer": "1.8.0-beta.1",
  "@antv/g-plugin-rough-svg-renderer": "1.8.0-beta.1"
}
```

其他包管理工具也都有对应的依赖覆盖方式，不再赘述：

- npm [overrides](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)
- yarn [resolutions](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/)
- pnpm [overrides](https://pnpm.io/package_json#pnpmoverrides)
