# @antv/g-plugin-device-renderer

## 1.9.9

### Patch Changes

-   d9e769f2: Merge anchor into modelmatrix.
-   d9e769f2: Fix dash effect in webgl.
-   d9e769f2: Stop propagation in g-gesture.

## 1.9.8

### Patch Changes

-   06bcc557: Update TextBaseline lazily should work in g-webgl.

## 1.9.7

### Patch Changes

-   70aa0b32: Retrieve runtime from context instead of global.
-   789bd4c9: Split a path containing multiple segments into subpaths.
-   Updated dependencies [70aa0b32]
-   Updated dependencies [789bd4c9]
    -   @antv/g-plugin-image-loader@1.3.7
    -   @antv/g-lite@1.2.7
    -   @antv/g-math@2.0.2

## 1.9.6

### Patch Changes

-   1b0901ba: Make FillMesh instanced to enhance perf.
-   1b0901ba: ConvertToPath should account for Rect with undefined x/y.
-   1b0901ba: Make textBaseline in SVG the same with Canvas.
-   1b0901ba: Add a fixed offset for Text.
-   1b0901ba: ConvertToPath should be compatible with empty coords.
-   1b0901ba: Draw 1px sub-pixel line correctly in webgl.
-   1b0901ba: Enhance perf of Text when fontSize changed in webgl.
-   Updated dependencies [1b0901ba]
-   Updated dependencies [1b0901ba]
-   Updated dependencies [1b0901ba]
-   Updated dependencies [1b0901ba]
-   Updated dependencies [1b0901ba]
    -   @antv/g-shader-components@1.8.2
    -   @antv/g-lite@1.2.6
    -   @antv/g-plugin-image-loader@1.3.6

## 1.9.5

### Patch Changes

-   ff2f4585: Return empty object for globalthis.
-   6fa21f84: Override offscreen canvas in runtime.
-   Updated dependencies [ff2f4585]
-   Updated dependencies [6fa21f84]
    -   @antv/g-lite@1.2.5
    -   @antv/g-plugin-image-loader@1.3.5

## 1.9.4

### Patch Changes

-   6757ccbd: Merge multiple simple paths into a single draw call
-   6757ccbd: Return an unprecise bound of HTML before it appending to document.
-   Updated dependencies [6757ccbd]
    -   @antv/g-lite@1.2.4
    -   @antv/g-plugin-image-loader@1.3.4

## 1.9.3

### Patch Changes

-   6cbaae4d: Change picking process from async to sync way
-   Updated dependencies [6cbaae4d]
    -   @antv/g-lite@1.2.3
    -   @antv/g-plugin-image-loader@1.3.3

## 1.9.2

### Patch Changes

-   0eb5142d: Avoid overriding defXY when parsing path
-   71990540: Make picking process async for WebGL2 & WebGPU implementations
-   Updated dependencies [0eb5142d]
-   Updated dependencies [71990540]
    -   @antv/g-lite@1.2.2
    -   @antv/g-plugin-image-loader@1.3.2

## 1.9.1

### Patch Changes

-   b0dd4788: Remove this syntax in @antv/g-math since it's already an ESM now
-   Updated dependencies [b0dd4788]
    -   @antv/g-plugin-image-loader@1.3.1
    -   @antv/g-shader-components@1.8.1
    -   @antv/g-lite@1.2.1
    -   @antv/g-math@2.0.1

## 1.9.0

### Minor Changes

-   Remove default export in @antv/g-math

### Patch Changes

-   Updated dependencies
    -   @antv/g-math@2.0.0
    -   @antv/g-lite@1.2.0
    -   @antv/g-plugin-image-loader@1.3.0
    -   @antv/g-shader-components@1.8.0
