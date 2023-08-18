# Contribution Guide

If you have any comment or advice, please report your [issue](https://github.com/antvis/g/issues), or make any change as you wish and submit an [PR](https://github.com/antvis/g/pulls).

## Reporting New Issues

- Please specify what kind of issue it is.
- Before you report an issue, please search for related issues. Make sure you are not going to open a duplicate issue.
- Explain your purpose clearly in tags(see **Useful Tags**), title, or content.

AntV group members will confirm the purpose of the issue, replace more accurate tags for it, identify related milestone, and assign developers working on it.

## Submitting Code

### Pull Request Guide

If you are developer of AntV repo and you are willing to contribute, feel free to create a new branch, finish your modification and submit a PR. AntV group will review your work and merge it to master branch.

```bash
# Create a new branch for development. The name of branch should be semantic, avoiding words like 'update' or 'tmp'. We suggest to use feature/xxx, if the modification is about to implement a new feature.
$ git checkout -b branch-name

# Run the test after you finish your modification. Add new test cases or change old ones if you feel necessary
$ npm test

# If your modification pass the tests, congratulations it's time to push your work back to us. Notice that the commit message should be written in the following format.
$ git add . # git add -u to delete files
$ git commit -m "fix(role): role.use must xxx"
$ git push origin branch-name
```

Then you can create a Pull Request at [G](https://github.com/antvis/g/pulls).

No one can guarantee how much will be remembered about certain PR after some time. To make sure we can easily recap what happened previously, please provide the following information in your PR.

1. Need: What function you want to achieve (Generally, please point out which issue is related).
2. Updating Reason: Different with issue. Briefly describe your reason and logic about why you need to make such modification.
3. Related Testing: Briefly describe what part of testing is relevant to your modification.
4. User Tips: Notice for scale users. You can skip this part, if the PR is not about update in API or potential compatibility problem.

### Style Guide

ESLint can help to identify styling issues that may exist in your code. Your code is required to pass the test from eslint. Run the test locally by `$ npm run lint`.

### Commit Message Format

You are encouraged to use [angular commit-message-format](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format) to write commit message. In this way, we could have a more trackable history and an automatically generated changelog.

```xml
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

（1）type

Must be one of the following:

- feat: A new feature
- fix: A bug fix
- docs: Documentation-only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation

（2）scope

The scope could be anything specifying place of the commit change.

（3）subject

Use succinct words to describe what did you do in the commit change.

（4）body

Feel free to add more content in the body, if you think subject is not self-explanatory enough, such as what it is the purpose or reason of you commit.

（5）footer

- **If the commit is a Breaking Change, please note it clearly in this part.**
- related issues, like `Closes #1, Closes #2, #3`

e.g.

```bash
fix($compile): [BREAKING_CHANGE] couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Document change on antvis/g#123

Closes #392

BREAKING CHANGE:

  Breaks foo.bar api, foo.baz should be used instead
```

Look at [these files](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit) for more details.

## Test

G provides a two-part test based on Jest:

- **unit test** [`__tests__/unit/`](./__tests__/unit/) Testing pure data modules or functions
- **integration test** [`__tests__/integration/`](./__tests__/integration/) Based on [node-canvas](https://github.com/Automattic/node-canvas), [jsdom](https://github.com/jsdom/jsdom/) and [headless-gl](https://github.com/stackgl/headless-gl), we test these 3 renderers `@antv/g-canvas`, `@antv/g-svg` and `@antv/g-webgl` on the serverside. We will compare the generated snapshots with golden images later.

## Publish

G uses [pnpm workspace](https://pnpm.io/workspaces) as the monorepo solution. We use the [workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace) to declare dependency version numbers between packages. During development process, pnpm will link packages from workspace while replacing them when publishing. Take `@antv/g-plugin-dragndrop` as an example:

```json
// package.json
"dependencies": {
  "@antv/g-lite": "workspace:*"
},

// when publishing...
"dependencies": {
  "@antv/g-lite": "1.1.0"
},
```

This makes it easy to perform version locking.

### Fully automated semantic releases

Referring to [S2's engineering practices](https://www.yuque.com/antv/vo4vyz/vtowig#HuNvY), we use [changesets](https://github.com/changesets/changesets) for fully automated semantic releases. It can automatically create GitHub Releases and automatically associate the release to the corresponding issue.

1. Create `release` branch from `next`
2. Checkout dev branch from `release`, run changeset and commit

```bash
pnpm run changeset
git add ./
git commit -a -m "chore: commit changeset"
```

3. Merge dev branch into `release` branch, CI version process will create a `Version Package` PR
4. Merge `release` into `next` branch

In addition, all API deprecations need to be `deprecate` prompted on the current stable version and guaranteed to be compatible on the current stable version until a new version is released.

### How to lock down dependencies

It is often necessary to lock down certain dependencies in case of emergency, or when testing beta versions, and different package management tools lock down versions in different ways.

tnpm uses `resolutions`. Take G2 as an example, if we want to test beta versions:

- Use `dependencies` to lock down **direct dependencies**.
- Use `resolutions` to lock down **indirect dependencies**, which can make sure some dependencies of G2 such as `@antv/gui` using the same beta versions

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

Other package management tools also have corresponding dependency overrides:

- npm [overrides](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)
- yarn [resolutions](https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/)
- pnpm [overrides](https://pnpm.io/package_json#pnpmoverrides)
