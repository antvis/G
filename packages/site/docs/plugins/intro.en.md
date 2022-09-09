---
title: Introduction to the plug-in system
order: -100
redirect_from:
    - /en/docs/plugins
---

# Set of plug-ins

Extensible plug-in mechanism and rich set of plug-ins：

-   Rendering Related
    -   [g-plugin-canvas-renderer](/en/docs/plugins/canvas-renderer) Rendering 2D graphics based on Canvas2D.
    -   [g-plugin-svg-renderer](/en/docs/plugins/svg-renderer) Rendering 2D graphics based on SVG.
    -   [g-plugin-device-renderer](/en/docs/plugins/device-renderer) Rendering 2D graphics based on GPUDevice.
    -   [g-plugin-html-renderer](/en/docs/plugins/html-renderer) Rendering DOM with HTML.
    -   [g-plugin-3d](/en/docs/plugins/3d) Extended 3D capabilities.
    -   [g-plugin-rough-canvas-renderer](/en/docs/plugins/rough-canvas-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and Canvs2D.
    -   [g-plugin-rough-svg-renderer](/en/docs/plugins/rough-svg-renderer) Perform hand-drawn style rendering with [rough.js](https://roughjs.com/) and SVG.
    -   [g-plugin-canvaskit-renderer](/en/docs/plugins/canvaskit-renderer) Rendering 2D graphics based on [Skia](https://skia.org/docs/user/modules/quickstart).
-   Picking
    -   [g-plugin-canvas-picker](/en/docs/plugins/canvas-picker) Do picking with Canvas2D and mathematical calculations.
    -   [g-plugin-svg-picker](/en/docs/plugins/svg-picker) Do picking with SVG and DOM API.
-   Interaction
    -   [g-plugin-dom-interaction](/en/docs/plugins/dom-interaction) Binds event listeners with DOM API.
    -   [g-plugin-control](/en/docs/plugins/control) Provides camera interaction for 3D scenes.
    -   [g-plugin-dragndrop](/en/docs/plugins/dragndrop) Provides Drag 'n' Drop based on PointerEvents.
-   Physics Engine
    -   [g-plugin-box2d](/en/docs/plugins/box2d) Based on [Box2D](https://box2d.org/).
    -   [g-plugin-matterjs](/en/docs/plugins/matterjs) Based on [matter.js](https://brm.io/matter-js/).
    -   [g-plugin-physx](/en/docs/plugins/physx) Based on [PhysX](https://developer.nvidia.com/physx-sdk).
-   Layout Engine
    -   [g-plugin-yoga](/en/docs/plugins/yoga) Provides Flex layout capabilities based on Yoga.
-   GPGPU
    -   [g-plugin-gpgpu](/en/docs/plugins/gpgpu) Provides GPGPU capabilities based on WebGPU.
-   CSS Selector
    -   [g-plugin-css-select](/en/docs/plugins/css-select) Supports for retrieval in the scene graph using CSS selectors.
-   A11y
    -   [g-plugin-a11y](/en/docs/plugins/a11y) Provides accessibility features.

# Relationship with Renderer

These [renderers](/en/docs/api/renderer/renderer) essentially consist of a set of plug-ins through which their capabilities can also be extended.

```js
renderer.registerPlugin(new Plugin());
```

In terms of naming convention, all plugin names start with `g-plugin-`. Let's take a deeper look into the structure of the plugin by analyzing `g-plugin-canvas-renderer`, which uses Canvas2D rendering and is one of the core plugins of `g-canvas`.

# Basic Structure

https://github.com/antvis/G/tree/next/packages/g-plugin-canvas-renderer

## package.json

As you can see from the `peerDependencies` of `package.json`, the most core dependency of a plugin is `@antv/g`, the core layer of G, which contains core objects such as dependency injection, canvas, base graphics, events, etc.

```json
"peerDependencies": {
    "@antv/g-lite": "^1.0.0"
},
```

## index.js

Opening the plugin's entry file, we can find that a plugin that inherits from `AbstractRendererPlugin` needs to implement two methods.

-   `init` Loading modules in containers
-   `destroy` Unloading modules in containers

```js
import { AbstractRendererPlugin, Module } from '@antv/g';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

// Define the module for this plugin
const containerModule = Module((register) => {
    register(ImagePool);
    // ...Omit registration of other dependencies
    register(CanvasRendererPlugin);
    register(LoadImagePlugin);
});

export class Plugin extends AbstractRendererPlugin {
    name = 'canvas-renderer';
    init(): void {
        this.container.load(containerModule, true);
    }
    destroy(): void {
        this.container.unload(containerModule);
    }
}
```

In the module we can register dependencies with the current container (one per canvas) or the global container (shared by all canvases) via `register`. It is also possible to mount it to an extension point defined in the core layer (which you will see shortly).

Here we have registered a `CanvasRendererPlugin`, let's go ahead and take a deeper look.

## CanvasRendererPlugin

The `inject` provided by `mana-syringe` allows us to get objects we care about, such as the original configuration when creating the canvas, the default camera, the context, and other services, with the injection of dependencies done by the container.

We also register ourselves with `RenderingPluginContribution`, an extension point provided by the G core layer, so that a set of rendering service plugins containing it are called when the core layer rendering service runs.

```js
import { inject, singleton } from '@antv/g';

// Realization of extension points
@singleton({ contrib: RenderingPluginContribution })
export class CanvasRendererPlugin implements RenderingPlugin {
    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig;

    @inject(DefaultCamera)
    private camera: Camera;

    @inject(ContextService)
    private contextService: ContextService<CanvasRenderingContext2D>;

    @inject(SceneGraphService)
    private sceneGraphService: SceneGraphService;

    // 渲染服务
    @inject(RenderingContext)
    private renderingContext: RenderingContext;
}
```

The next step is to select the appropriate execution timing through a series of `hooks` provided by the rendering service, e.g. to process the next DPR when the rendering service is initialized.

```js
apply(renderingService: RenderingService) {
    // When the rendering service is initialized...
    renderingService.hooks.init.tap(CanvasRendererPlugin.tag, () => {
        // Contextual services using container injection
        const context = this.contextService.getContext();
        const dpr = this.contextService.getDPR();
        // scale all drawing operations by the dpr
        // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
        context && context.scale(dpr, dpr);

        // Rendering Context Service with Container Injection
        this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
        this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
        this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });
}
```

All plugins follow the above structure implementation.

# Relationship between plug-ins

There are also dependencies between plugins, for example [g-plugin-gpgpu](/en/docs/plugins/gpgpu) depends on [g-plugin-device-renderer](/en/docs/plugins/device-renderer). You need to exclude dependencies when building UMD independently, see [build instructions]() for details.
