---
title: 依赖注入与容器
order: 2
---

在面向对象编程领域，[SOLID](<https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)>) 、[“组合优于继承”](https://en.wikipedia.org/wiki/Composition_over_inheritance) 都是经典的设计原则。

IoC(Inversion of Control) 控制反转这种设计模式将对象的创建销毁、依赖关系交给容器处理，是以上设计原则的一种经典实践。其中它的一种实现 DI(Dependency Injection) 即依赖注入在工程领域应用十分广泛，最著名的当属 Spring。

而在前端领域，[Angular](https://angular.io/guide/dependency-injection)、[NestJS](https://docs.nestjs.com/fundamentals/custom-providers) 也都实现了自己的 IoC 容器。

我们选择了 [InversifyJS](https://github.com/inversify/InversifyJS/blob/master/wiki/oo_design.md) 作为轻量的 IoC 容器，统一管理各类复杂的服务，实现松耦合的代码结构，同时具有以下收益：

- 提供高扩展性：
  - 支持上层（`g-canvas/svg/webgl`）替换上下文与渲染服务
  - 渲染流程插件化
- 便于测试。例如 `g-webgl` 测试用例中替换渲染引擎服务为基于 `headless-gl` 的渲染服务。

# 多层次容器

G 需要支持多种渲染引擎，由此创建的多个 `Canvas` 对象可以共存并同时渲染。

```javascript
import { Canvas as Canvas2DCanvas } from 'g-canvas';
import { Canvas as WebGLCanvas } from 'g-webgl';

const canvas1 = new Canvas2DCanvas({ container: 'c1' });
const canvas2 = new Canvas2DCanvas({ container: 'c2' });
const canvas3 = new WebGLCanvas({ container: 'c3' });

const circle = new Circle({ style: { r: 10 } });

canvas1.add(circle);
canvas2.add(circle);
canvas3.add(circle);
```

试想如果我们只有一个全局容器，其中绑定的所有服务自然也都成了全局服务，在该场景下销毁 `g-canvas` 的渲染服务，将影响到 `g-webgl` 的展示。

在 Angular 中也有[分层容器](https://angular.io/guide/hierarchical-dependency-injection)的应用。我们使用的是 InversifyJS 提供的[层次化依赖注入功能](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md)。在子容器中能访问到父容器中绑定的服务，反之不可。

## 全局容器

顾名思义，这是一个所有 `Canvas` 共享的，都能访问到其中服务的容器。其中包含如下全局对象与服务。

### ECS 服务

在引入 `g-core` 时便会在全局容器中注入 `g-ecs` 提供的一个 ECS 实现。基于它我们注册了一系列组件（Component）和系统（System）。

### SceneGraphAdapter

为了在 `Group/Shape` 上提供类似 CSS 选择器的查询能力，我们按照 `css-select` 实现了一个适配器。

## Canvas 容器

### 配置对象

每个 `Canvas` 的配置对象。

### 上下文服务

### 渲染服务
