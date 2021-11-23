---
title: 理解依赖注入与容器
order: 2
---

在面向对象编程领域，[SOLID](<https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)>) 、[“组合优于继承”](https://en.wikipedia.org/wiki/Composition_over_inheritance) 都是经典的设计原则。

IoC(Inversion of Control) 控制反转这种设计模式将对象的创建销毁、依赖关系交给容器处理，是以上设计原则的一种经典实践。其中它的一种实现 DI(Dependency Injection) 即依赖注入在工程领域应用十分广泛，最著名的当属 Spring。

而在前端领域，[Angular](https://angular.io/guide/dependency-injection)、[NestJS](https://docs.nestjs.com/fundamentals/custom-providers) 也都实现了自己的 IoC 容器。

我们选择了 [mana-syringe](https://github.com/umijs/mana/tree/master/packages/mana-syringe) 作为轻量的 IoC 容器，统一管理各类复杂的服务，实现松耦合的代码结构，同时具有以下收益：

-   提供高扩展性：
    -   支持上层 `g-canvas/svg/webgl` 替换上下文与渲染服务，实现渲染器运行时可切换
    -   核心层暴露扩展点，内部默认实现可替换，插件系统也正是基于此设计
-   便于测试。例如 `g-webgl` 测试用例中替换渲染引擎服务为基于 `headless-gl` 的渲染服务。

下面我们简单介绍下 G 目前对于容器的使用情况。

# 多层次容器

首先什么是容器呢？个人理解就是一个 Map，在注册时分配一个 key/token 就可以将任何对象放进去，当后续需要使用时只需要提供这个 key/token，容器会帮我们完成对象的实例化，我们并不关心它们是怎么来的。例如在开发插件时，我们不关心 `CanvasConfig` 画布配置是怎么来的，直接使用就好；我们也不用关心这个插件该被如何创建，声明为单例后容器会帮我们创建：

```js
// 使用核心暴露的扩展点、接口
import { RenderingPluginContribution, RenderingPlugin } from '@antv/g';
// 使用 mana 提供的装饰器
import { inject, singleton } from 'mana-syringe';

// 在扩展点上挂载，并声明为单例模式
@singleton({ contrib: RenderingPluginContribution })
export class RenderGraphPlugin implements RenderingPlugin {
    // 注入依赖
    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig;
}
```

容器之间也可以有层次结构，例如子容器中可以获取到父容器中的内容。在 G 中我们有一个全局容器，里面会存放一些全局不变的对象或者方法（例如判断一个点在不在指定图形内）。当每个画布被创建时，我们都会分配一个子容器，里面存放一些画布独有的对象（例如上下文服务、渲染服务、插件集等），这样各个画布彼此隔离不会互相影响：

```
GlobalContainer 全局容器
    - CanvasContainer 每个画布创建时拥有一个
    - CanvasContainer
    - ...
```

# 全局容器

顾名思义，这是一个所有画布共享的，都能访问到其中服务的容器。其中包含如下全局对象与服务，当然在插件中可以替换这些默认实现。以下全局对象的注册可以在 `@antv/g/src/global-module.ts` 中找到。

## DisplayObjectPool

一个全局对象池，可以通过实体 id 获取。例如在 [g-plugin-webgl-renderer](/zh/docs/plugins/webgl-renderer) 基于 GPU 颜色编码的拾取过程中，会通过读取纹理获取到的 id 反查命中对象。

## SceneGraphSelector

在构建了场景图后，查询其中的节点是常用的操作。类比到 DOM 树，我们可以使用类似 `getElementById/querySelector` 按 id、name 以及其他选择器查询。

为了实现上述查询能力，需要实现以下选择器接口，我们提供了一个默认的选择器实现，它已经具有基础的查询能力：

```ts
export interface SceneGraphSelector {
    selectOne<R extends IElement, T extends IElement>(query: string, root: R): T | null;
    selectAll<R extends IElement, T extends IElement>(query: string, root: R): T[];
    is<T extends IElement>(query: string, element: T): boolean;
}
```

正如之前提到过的，插件可以覆盖掉默认的实现。例如 [g-plugin-css-select](/zh/docs/plugins/css-select) 就扩展了类似 CSS 选择器的查询能力，内部使用 `css-select` 实现了一个适配器。

```js
// g-plugin-css-select

@singleton({ token: SceneGraphSelector })
export class CSSSceneGraphSelector implements SceneGraphSelector {}

// 注册依赖，覆盖默认 SceneGraphSelector 实现
register(CSSSceneGraphSelector);
```

安装这个插件之后，就可以使用属性选择器了：

```js
solarSystem.querySelectorAll('[r=25]');
```

## OffscreenCanvasCreator

在度量文本、创建渐变时，需要用到 canvas 上下文，此时使用 [OffscreenCanvas](https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas) 性能更好，当然如果浏览器不支持需要自动降级成常规 `<canvas>`。

## TextService

主要负责度量文本，其间会使用到 OffscreenCanvasCreator。

## GeometryUpdaterFactory

根据传入的图形类型，计算几何信息。例如下面展示了 Circle 的计算逻辑：

```js
@singleton({ token: { token: GeometryAABBUpdater, named: SHAPE.Circle } })
export class CircleUpdater implements GeometryAABBUpdater<ParsedCircleStyleProps> {
    update(parsedStyle: ParsedCircleStyleProps) {
        const { r = 0, x = 0, y = 0 } = parsedStyle;
        return {
            width: r * 2,
            height: r * 2,
            x,
            y,
        };
    }
}
```

当我们需要创建一个新的基础图形时，也需要提供一个对应的计算方式。例如 [g-plugin-3d](/zh/docs/plugins/3d) 中提供的 Cube、Sphere 等。

## StylePropertyParserFactory

负责解析图形的属性，例如：

-   将 [Path](/zh/docs/api/basic/path) 的 [path](/zh/docs/api/basic/path#path) 属性解析成可供后续渲染的结构
-   将 [transform](/zh/docs/api/basic/display-object#transform) 属性由 `translate(0, 0)` 这样的字符串解析成变换矩阵

## StylePropertyUpdaterFactory

例如以下属性发生改变时，需要重新计算图形的几何信息：

```js
addPropertiesHandler<number, number>(
    [
        'x1',
        'x2',
        'y1',
        'y2', // Line
        'r', // Circle
        'rx',
        'ry', // Ellipse
        'width',
        'height', // Image/Rect
        'path', // Path
        'points', // Polyline/Polygon
        'text', // Text
        'shadowBlur',
        'shadowOffsetX',
        'shadowOffsetY',
        'lineWidth',
        'filter',
        'font',
        'fontSize',
        'fontFamily',
        'fontStyle',
        'fontWeight',
        'fontVariant',
        'lineHeight',
        'letterSpacing',
        'padding',
        'wordWrap',
        'wordWrapWidth',
        'leading',
        'textBaseline',
        'textAlign',
        'whiteSpace',
    ],
    undefined,
    undefined,
    updateGeometry,
  );
```

## StylePropertyMergerFactory

在动画时，合并动画中属性的两个值。例如将 `transform: translate(0, 0)` 和 `transform: translate(10px, 0)` 合并。

# 画布容器

以下对象的注册可以在 `@antv/g/src/canvas-module.ts` 中找到。

## CanvasConfig

创建画布时提供的配置对象，可以随时通过 CanvasConfig 获取：

```js
// 使用核心暴露的扩展点、接口
import { RenderingPluginContribution, RenderingPlugin } from '@antv/g';
// 使用 mana 提供的装饰器
import { inject, singleton } from 'mana-syringe';

// 在扩展点上挂载，并声明为单例模式
@singleton({ contrib: RenderingPluginContribution })
export class RenderGraphPlugin implements RenderingPlugin {
    // 注入依赖
    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig;
}
```

## ContextService

上下文服务，`g-canvas/svg/webgl` 这些渲染器包都会实现这个接口。

```js
interface ContextService<Context> {
    init(): void;
    destroy(): void;
    getContext(): Context | null;
    getDomElement(): HTMLElement | null;
    getDPR(): number;
    getBoundingClientRect(): DOMRect | undefined;
    resize(width: number, height: number): void;
    applyCursorStyle(cursor: string): void;
}
```

每个画布容器中只能有一个，这是在定义 token 时就决定的。当我们在运行时切换渲染器时，旧的上下文服务会首先销毁，然后新的才会初始化：

```js
export const ContextService = Syringe.defineToken('ContextService', { multiple: false });
```

## RenderingService

定义了一个通用的渲染流程以及内置插件，在以下生命周期节点提供流程控制：

```js
hooks = {
    init: new AsyncSeriesHook(),
    prepare: new SyncWaterfallHook<DisplayObject | null>(['object']),
    beginFrame: new SyncHook(),
    beforeRender: new SyncHook<DisplayObject>(['objectToRender']),
    render: new SyncHook<DisplayObject>(['objectToRender']),
    afterRender: new SyncHook<DisplayObject>(['objectToRender']),
    endFrame: new SyncHook(),
    destroy: new SyncHook(),
    pick: new AsyncSeriesWaterfallHook<PickingResult, PickingResult>(['result']),
    pointerDown: new SyncHook<InteractivePointerEvent>(['event']),
    pointerUp: new SyncHook<InteractivePointerEvent>(['event']),
    pointerMove: new SyncHook<InteractivePointerEvent>(['event']),
    pointerOut: new SyncHook<InteractivePointerEvent>(['event']),
    pointerOver: new SyncHook<InteractivePointerEvent>(['event']),
    pointerWheel: new SyncHook<InteractivePointerEvent>(['event']),
};
```

例如 [g-plugin-canvas-renderer](/zh/docs/plugins/canvas-renderer) 希望在渲染服务初始化时做一些事情：

```js
renderingService.hooks.init.tap(CanvasRendererPlugin.tag, () => {});
```

更多相关内容详见[插件开发](/zh/docs/plugins/intro)。

## RenderingContext

当前渲染上下文，包含渲染根节点，以及当前是否需要重绘：

```js
interface RenderingContext {
    /**
     * root of scenegraph
     */
    root: Group;

    /**
     * force rendering at next frame
     */
    force: boolean;

    removedRenderBoundsList: AABB[];

    /**
     * reason of re-render, reset after every renderred frame
     */
    renderReasons: Set<RENDER_REASON>;

    dirty: boolean;
}
```

## RenderingPluginContribution 扩展点

更多相关内容详见[插件开发](/zh/docs/plugins/intro)。

## EventService

事件服务。提供事件传播流程处理、不同坐标系下的转换逻辑。

例如提供从浏览器的 Client 坐标系到画布 Viewport 视口坐标系的[转换方法](/zh/docs/api/canvas#client---viewport)：

```js
client2Viewport(client: PointLike): PointLike {
    const bbox = this.contextService.getBoundingClientRect();
    return new Point(client.x - (bbox?.left || 0), client.y - (bbox?.top || 0));
}
```
