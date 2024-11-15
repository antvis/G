# @antv/g-lite

## 2.2.4

### Patch Changes

-   252427f5: cloneNode copy complete config

## 2.2.3

### Patch Changes

-   ad11268d: fix: ellipses are not displayed when the text contains line breaks

## 2.2.2

### Patch Changes

-   0b639b81: optimize massive attrs clone

## 2.2.1

### Patch Changes

-   939663c2: fix: when an element is destroyed, its child elements are not destroyed

## 2.2.0

### Minor Changes

-   a3e07c16: perf: optimize canvas renderer performance

## 2.1.4

### Patch Changes

-   4aa12e8c: fix: `markerStartOffset`/`markerEndOffset` of the path in the svg/canvas renderer is drawn abnormally

## 2.1.3

### Patch Changes

-   e10b8679: fix canvas cannot destroy

## 2.1.2

### Patch Changes

-   fc61bc17: fix: build target

## 2.1.1

### Patch Changes

-   aed1e752: perf: optimize large image rendering performance
-   133b88be: fix angle value parse

## 2.1.0

### Minor Changes

-   b09ec805: optimize performance

## 2.0.11

### Patch Changes

-   05adafa1: chore: fix dependency version information

## 2.0.10

### Patch Changes

-   update version

## 2.0.9

### Patch Changes

-   fcd04674: fix: html element's `getBounds` logic exception (#1743)

## 2.0.8

### Patch Changes

-   7c68899d: feat: add dblClickSpeed init config (#1710) (#1736)
-   8832fb08: fix: HTML element bounding box calculation logic (#1743)

## 2.0.7

### Patch Changes

-   5890d1ce: fix setRenderer status

## 2.0.6

### Patch Changes

-   a950bbc7: publish g-lite

## 2.0.5

### Patch Changes

-   335558a7: Update d3-color to latest version avoiding vulnerable packages.

## 2.0.4

### Patch Changes

-   5dfc52e3: Make sure offset widht & height existed.

## 2.0.3

### Patch Changes

-   36521463: Correct mouse position even when scaling the container using CSS.

## 2.0.2

### Patch Changes

-   2948b0f8: Pass webxr frame on each tick when rendering.

## 2.0.1

### Patch Changes

-   acabbcb0: Update Text's geometry before getting computed length.

## 2.0.0

### Major Changes

-   424711bd: Use G6.0.

### Minor Changes

-   424711bd: X/y won't affect transform now.

### Patch Changes

-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Insert event will trigger by default.
-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Transform origin should be relative to geometry bounds when using percentage unit.
-   424711bd: Lazy calculate geometry.
-   424711bd: Remove anchor attribute and modify geometry bounds calculation.
-   424711bd: Test.
-   424711bd: x/y in rect can be omitted.
-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Group geometry updater.
-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Test.
-   424711bd: Refactor transform.
-   424711bd: Test.
-   424711bd: Lazy calculate geometry.
-   424711bd: Transform can only be affected with the attribute.
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
-   Updated dependencies [424711bd]
    -   @antv/g-math@3.0.0

## 1.3.0-next.20

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.6

## 1.3.0-next.19

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.5

## 1.3.0-next.18

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.4

## 1.3.0-next.17

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.3

## 1.3.0-next.16

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.2

## 1.3.0-next.15

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.1

## 1.3.0-next.14

### Patch Changes

-   Test.
-   Updated dependencies
    -   @antv/g-math@2.0.3-next.0

## 1.3.0-next.13

### Patch Changes

-   Test.

## 1.3.0-next.12

### Patch Changes

-   Test.

## 1.3.0-next.11

### Patch Changes

-   Test.

## 1.3.0-next.10

### Patch Changes

-   Transform origin should be relative to geometry bounds when using percentage unit.

## 1.3.0-next.9

### Patch Changes

-   Group geometry updater.

## 1.3.0-next.8

### Patch Changes

-   Test.

## 1.3.0-next.7

### Patch Changes

-   Refactor transform.

## 1.3.0-next.6

### Patch Changes

-   Lazy calculate geometry.

## 1.3.0-next.5

### Patch Changes

-   142a21f55: Insert event will trigger by default.
-   Lazy calculate geometry.

## 1.3.0-next.4

### Patch Changes

-   Test.

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

## 1.2.24

### Patch Changes

-   10397c19: Support shadowRoot when picking.

## 1.2.23

### Patch Changes

-   1d25bf84: ClipPath should be copied first before calculate intersection bounds.

## 1.2.22

### Patch Changes

-   11d23f39: Support size attenuation.

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
