# @antv/g-lite

## 1.2.8

### Patch Changes

-   3d4f5da7: Support size attenuation.
-   3d4f5da7: Polyline should support 3D points.
-   3d4f5da7: Support rotation when applying billboard effect.

## 1.2.7

### Patch Changes

-   70aa0b32: Retrieve runtime from context instead of global.
-   789bd4c9: Split a path containing multiple segments into subpaths.
-   Updated dependencies [70aa0b32]
-   Updated dependencies [789bd4c9]
    -   @antv/g-math@2.0.2

## 1.2.6

### Patch Changes

-   1b0901ba: Make FillMesh instanced to enhance perf.
-   1b0901ba: ConvertToPath should account for Rect with undefined x/y.
-   1b0901ba: Make textBaseline in SVG the same with Canvas.
-   1b0901ba: Add a fixed offset for Text.
-   1b0901ba: ConvertToPath should be compatible with empty coords.

## 1.2.5

### Patch Changes

-   ff2f4585: Return empty object for globalthis.
-   6fa21f84: Override offscreen canvas in runtime.

## 1.2.4

### Patch Changes

-   6757ccbd: Return an unprecise bound of HTML before it appending to document.

## 1.2.3

### Patch Changes

-   6cbaae4d: Change picking process from async to sync way

## 1.2.2

### Patch Changes

-   0eb5142d: Avoid overriding defXY when parsing path
-   71990540: Make picking process async for WebGL2 & WebGPU implementations

## 1.2.1

### Patch Changes

-   b0dd4788: Remove this syntax in @antv/g-math since it's already an ESM now
-   Updated dependencies [b0dd4788]
    -   @antv/g-math@2.0.1

## 1.2.0

### Minor Changes

-   Remove default export in @antv/g-math

### Patch Changes

-   Updated dependencies
    -   @antv/g-math@2.0.0
