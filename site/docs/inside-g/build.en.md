---
title: Build Instructions
order: 1
---

# Dependencies

In the current monorepo, the dependencies of each package are as follows:

- `@antv/g`: The core package, using `mana-syringe` for dependency injection.
- `@antv/g-canvas/svg/webgl`: Renderer packages, dependent on `@antv/g`, with a series of internally registered plugins.
- `@antv/g-plugin-xxx`: Plugin packages, dependent on `@antv/g`; some plugins may also depend on other plugins.

Notably, `g-webgl` uses wasm to transpile GLSL to WGSL.

For the build process, we use [father](https://github.com/umijs/father) to build CJS and ESM, and webpack 4 to build UMD.

# CJS and ESM

We use `father` for the build:

```json
// Root package.json
"build": "father build",
```

In `fatherrc`, we select the `babel` mode:

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
    // Omit other build packages
  ]
}
```

After running, the corresponding ESM and CJS files for the source files will be generated in the `/es` and `/lib` directories of each sub-package.

# UMD

We use webpack 4 to build UMD. Taking `g-canvas` as an example, we exclude the following in the configuration file:

```js
module.exports = {
    ...common,
    externals: {
        '@antv/g': {
            commonjs: '@antv/g',
            commonjs2: '@antv/g',
            amd: '@antv/g',
            root: 'G', // Accessed via window.G at runtime
        },
        'mana-syringe': {
            commonjs: 'mana-syringe',
            commonjs2: 'mana-syringe',
            amd: 'mana-syringe',
            root: ['G', 'ManaSyringe'], // Accessed via window.G.ManaSyringe at runtime
        },
    },
    output: {
        library: ['G', 'Canvas2D'], // Exposes window.G.Canvas2D
        libraryTarget: 'umd',
        filename: 'index.umd.min.js',
    },
};
```

# WASM

Notably, `g-webgl` requires WASM, so we add an extra plugin:

```js
plugins: [
    new WasmPackPlugin({
        crateDirectory: path.join(__dirname, 'rust'), // Crate is located in /rust
        forceMode: 'production',
    }),
],
```
