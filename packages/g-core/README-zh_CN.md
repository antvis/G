[English](./README.md) | 简体中文

# g-core

[![](https://img.shields.io/travis/antvis/g-core.svg)](https://travis-ci.org/antvis/g-core)
![](https://img.shields.io/badge/language-javascript-red.svg)
![](https://img.shields.io/badge/license-MIT-000000.svg)

借助 `g-ecs` 提供的简单 ECS 实现，我们有了将复杂渲染对象及数据处理拆分的能力。在 `g-core` 中我们将定义统一的渲染流程，提供一系列扩展点供 `g-canvas/svg/webgl/mobile` 等上层实现。

## 系统和扩展点

目前 `g-core` 在每一帧运行时都会经历多个系统处理：

- Context 上下文系统
- Culling 剔除系统，找到处于当前视口内的实体列表
- SceneGraph 场景图系统，计算每个实体的变换矩阵
- AABB 包围盒计算系统
- Renderer 渲染系统

### 剔除系统

提升渲染性能的通用做法之一便是尽可能减少渲染对象的数目。剔除系统（CullingSystem）负责找出当前处于视口内的最小待渲染对象集合，帮助后续渲染系统做到按需渲染。

我们的剔除系统定义在 `src/systems/Culling` 中，该系统关注所有 `Renderable/Cullable/Geometry` 组件，会依次调用注册在该系统上的所有剔除策略，通过策略返回的可见性结果修改 `Cullable` 组件的 `visible` 属性供后续渲染系统过滤使用。

由于不同场景下（2D/3D）剔除策略完全不同，即使同一场景下也会有差异（例如 3D 场景基于 `BoundingBox` 包围盒或 `BoundingSphere` 包围球），因此我们将剔除策略（`CullingStrategy`）作为扩展点暴露出来，剔除系统只负责依次调用他们得到可见性结果，并不关系这些策略的实现细节。

`g-core` 暴露的剔除策略扩展点定义如下，仅包含一个简单的可见性检测方式供上层实现：

```typescript
// g-core/systems/Culling
export interface CullingStrategy {
  isVisible(enity: Entity): boolean;
}
```

我们以 `g-webgl` 为例，绑定了视锥剔除（`FrustumCulling`）到剔除策略上：

```typescript
import { CullingStrategy } from '@antv/g-core';
import { FrustumCulling } from './contributions/FrustumCulling';

// 视锥剔除作为单例模式
bind(FrustumCulling).toSelf().inSingletonScope();
// 绑定到剔除策略上
bind(CullingStrategy).toService(FrustumCulling);
// 我们也可以继续绑定多种剔除策略
// eg. bind(CullingStrategy).toService(MyCullingStrategy);
```

其中具体的剔除实现类只需要实现扩展点接口即可，例如 `g-webgl` 中使用了一种优化后的[基于视锥剔除的检测](https://github.com/antvis/GWebGPUEngine/issues/3)：

```typescript
@injectable()
export class FrustumCulling implements CullingStrategy {
  @inject(Camera)
  private camera: ICamera;

  isVisible(entity: Entity) {
    //...省略具体实现
  }
}
```

### 上下文系统

各个渲染环境的一大差异便是上下文（`Context`），这个上下文不仅仅局限于渲染，也会影响到事件系统。
例如 `g-canvas` 渲染时使用的是 `CanvasRenderingContext2D`，而 `g-webgl` 使用 `WebGLEngine`。创建、销毁以及重新改变尺寸大小的实现也各不相同，因此我们将上下文服务暴露出来供上层实现。

```typescript
// g-core/systems/Context
export interface ContextService<Context> {
  init(): Promise<Context | null> | void;
  destroy(): Promise<void> | void;
  resize(width: number, height: number): void;
  setContext(context: Context): void;
  getContext(): Context | null;
}
```

我们以 `g-canvas` 为例，继承基类 `DefaultContextService` 后可以自行实现以上接口，例如使用 DOM API 创建 `HTMLCanvasElement`，获取 `2d` 上下文等等。

```typescript
// g-canvas/Canvas2DContext
import { DefaultContextService } from '@antv/g-core';
@injectable()
export class Canvas2DContext extends DefaultContextService<CanvasRenderingContext2D> {}

// 绑定上下文服务到 Canvas2D
bind(Canvas2DContextService).toSelf().inSingletonScope();
bind(ContextService).toService(Canvas2DContextService);
```

同理，对于 `g-webgl` 也可以依此实现，例如我们基于 `regl` 封装了一整个渲染上下文（RenderingContext）：

```typescript
// g-webgl/WebGLContext
import { DefaultContextService } from '@antv/g-core';
@injectable()
export class WebGLContext extends DefaultContextService<RenderingContext> {}

// 绑定上下文服务到 WebGLContext
bind(WebGLContextService).toSelf().inSingletonScope();
bind(ContextService).toService(WebGLContextService);
```

⚠️ 为了保证 `g-core` 能正常运行，上层至少需要实现一个上下文，通常也应该如此。

### 场景图系统

场景图是为了实现渲染对象的层次结构，g 提供的 `Group` 便是如此。父对象的变换（Transform）会影响到子对象。
旧版 g 的实现将矩阵运算以及 transform 操作放在 `Element` 基类对象上。我们将其拆分到 `Transform` 和 `Hierarchy` 组件并由专门的场景图系统（SceneGraph）负责运算更新。

该系统定义在 `g-core/systems/SceneGraph` 中，暂未提供扩展点。

### 包围盒系统

每个 `Geometry` 组件在设定好属性之后，局部坐标系下自身的包围盒（AABB）也就可以计算出来。但共享同一个 `Geometry` 的多个 `Renderable` 受 transform 的影响，在世界坐标系下自身包围盒不一定完全相同。

因此我们需要有一个专门的包围盒计算系统负责计算每一个 `Renderable` 在世界坐标系下的包围盒，供其他系统例如 `Culling` 使用。

该系统定义在 `g-core/systems/AABB` 中，暂未提供扩展点。

### 渲染系统

渲染系统定义在 `src/systems/Renderer` 中，该系统关注所有包含了 `Renderable` 组件的实体。通过查看每一个实体上的 `Cullable` 组件判定可见性，过滤出当前可见的所有实体，调用暴露的扩展方法。

该系统暴露的扩展点为：

```typescript
export interface RendererFrameContribution {
  // 每一帧开始时调用
  beginFrame(): Promise<void>;
  // 实体列表具体渲染方法
  renderFrame(entities: Entity[]): Promise<void>;
  // 每一帧结束时调用
  endFrame(): Promise<void>;
  // 系统销毁时调用
  destroy(): void;
}
```

我们以 `g-canvas` 为例，通过工厂方法获取每个实体对应的渲染器进行渲染：

```typescript
@injectable()
export class CanvasFrameRenderer implements RendererFrameContribution {
  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: string) => ShapeRenderer | null;

  async beginFrame() {}
  async endFrame() {}
  async renderFrame(entities: Entity[]) {
    for (const entity of entities) {
      const renderable = entity.getComponent(Renderable);
      const renderer = this.shapeRendererFactory(renderable.type);
      if (renderer) {
        renderer.render(entity);
      }
    }
  }
}
```

然后绑定每一种图形对应的渲染器：

```typescript
bind(CircleRenderer).toSelf().inSingletonScope();
bind(EllipseRenderer).toSelf().inSingletonScope();
bind(ShapeRenderer).to(CircleRenderer).whenTargetNamed(SHAPE.Circle);
bind(ShapeRenderer).to(EllipseRenderer).whenTargetNamed(SHAPE.Ellipse);
```

### 动画系统

渲染系统定义在 `src/systems/Timeline` 中，该系统关注所有包含了 `Animator` 组件的实体。得益于 ECS 中系统会自动在每一帧运行，我们不需要使用例如 `d3-timer` 这样的定时器。
在每一帧中，对于需要执行动画的属性，我们使用 `d3-ease` 结合传入的缓动方法、当前运行时间进行插值，得到一个 `ratio`，随后交给更新器完成属性的更新。

提供针对 `Shape` 属性的更新器接口，上层可以任意注册针对任意属性的更新器：

```typescript
export interface AttributeAnimationUpdater {
  filter(attribute: string, fromAttribute: any, toAttribute: any): boolean;
  update<T>(entity: Entity, fromAttribute: T, toAttribute: T, ratio: number): T;
}
```

例如核心层当前注册了两个更新器：

```typescript
// 兜底默认属性更新器
export class DefaultAttributeAnimationUpdater implements AttributeAnimationUpdater {}
// 关注颜色
export class ColorAttributeAnimationUpdater implements AttributeAnimationUpdater {}
```

### [WIP]事件系统

## 全局注入对象

在上层实现 `g-core` 提供的各个扩展点时，同样可以从容器中获取注入的一些全局对象。

### 获取 Canvas 配置

从容器中可以获取用户传入 `Canvas` 的原始配置，例如在上下文服务中用来初始化：

```javascript
@inject(CanvasConfig)
protected canvasConfig: CanvasCfg;
```

### 获取一个任意系统

我们可以调用任意一个 `System` 提供的方法，例如在 `g-webgl` 中我们使用了 `FrameGraph` 构建渲染流程：

```javascript
@inject(System)
@named(FrameGraphSystem.tag)
private frameGraphSystem: FrameGraphSystem;
```

## 上层扩展技巧

上层在开发时除了实现 `g-core` 提供的扩展点，也可以定义自身的扩展点供内部使用。例如 `g-canvas` 在实现传入 `Shape` 的样式配置时，可以提供针对每一种样式属性 (fill/opacity/linedash) 的扩展方法：

```typescript
@injectable()
export abstract class BaseRenderer implements ShapeRenderer {
  @inject(ContextService)
  protected contextService: ContextService<CanvasRenderingContext2D>;

  @inject(ContributionProvider)
  @named(StyleRendererContribution)
  protected handlers: ContributionProvider<StyleRendererContribution>;

  // 供子类 Circle/Ellipse 实现
  abstract generatePath(entity: Entity): void;

  render(entity: Entity) {
    const context = this.contextService.getContext();

    if (context) {
      context.save();
      context.beginPath();

      this.generatePath(entity);

      // 每个样式属性可以绑定各自的渲染方法
      this.handlers.getContributions().forEach((handler) => {
        handler.apply(entity, context);
      });

      context.closePath();
      context.restore();
    }
  }
}
```

## 参考资料

- [Theia 中的服务和扩展点](https://theia-ide.org/docs/services_and_contributions)
