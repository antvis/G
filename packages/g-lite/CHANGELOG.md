# @antv/g-lite

## 1.3.0-next.3

### Patch Changes

-   e4c1645ae: Test.

## 1.3.0-next.2

### Patch Changes

-   8efc380a5: x/y in rect can be omitted.
-   614e15671: Transform can only be affected with the attribute.

## 1.3.0-next.1

### Patch Changes

-   Remove anchor attribute and modify geometry bounds calculation.

## 1.3.0-next.0

### Minor Changes

-   X/y won't affect transform now.

## 1.2.21

### Patch Changes

-   5f5cf270: Disable memoize during interpolation to avoid OOM.

## 1.2.20

### Patch Changes

-   ce11b242: Setup native html map per canvas instead of global singleton.

## 1.2.19

### Patch Changes

-   6492cdf1: Path should not downgrade to line when billboard enabled.

## 1.2.18

### Patch Changes

-   4fdee19f: Keep aspect ration in image.
-   4fdee19f: Fix picking error when isBillboard enabled.

## 1.2.17

### Patch Changes

-   51b42d06: Use correct position when insertBefore.

## 1.2.16

### Patch Changes

-   7e3dbd76: Removing points attribute from polyline & polygon won't throw error now.

## 1.2.15

### Patch Changes

-   f109d836: Skip triggering render hooks when camera changed only.

## 1.2.14

### Patch Changes

-   5e0de3dd: Add disableRenderHooks switch for WebGL renderer.

## 1.2.13

### Patch Changes

-   e5d69c70: Fix gradient path & add more geometry.

## 1.2.12

### Patch Changes

-   eb61cba4: Add polyfill for performance.now.
-   eb61cba4: Remove redundant m command when parsing path.

## 1.2.11

### Patch Changes

-   d63ea0bf: Add polyfill for performance.now.

## 1.2.10

### Patch Changes

-   414d08d9: Support multiple canvases in one container.

## 1.2.9

### Patch Changes

-   3856560c: Fix points type in Polyline & Polygon.

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
