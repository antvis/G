---
title: 插件结构
order: -99
---

In terms of naming convention, all plugin names start with `g-plugin-`. Let's take a deeper look into the structure of the plugin by analyzing `g-plugin-canvas-renderer`, which uses Canvas2D rendering and is one of the core plugins of `g-canvas`.

## Basic Structure

https://github.com/antvis/G/tree/next/packages/g-plugin-canvas-renderer

### package.json

As you can see from the `peerDependencies` of `package.json`, the most core dependency of a plugin is `@antv/g`, the core layer of G, which contains core objects such as dependency injection, canvas, base graphics, events, etc.

```json
"peerDependencies": {
    "@antv/g-lite": "^1.0.0"
},
```

### index.js

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

### CanvasRendererPlugin

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

## Relationship between plug-ins

There are also dependencies between plugins, for example [g-plugin-gpgpu](/en/plugins/gpgpu) depends on [g-plugin-device-renderer](/en/plugins/device-renderer). You need to exclude dependencies when building UMD independently, see [build instructions]() for details.
