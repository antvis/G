[English](./README.md) | 简体中文

# g-ecs

[![](https://img.shields.io/travis/antvis/g-ecs.svg)](https://travis-ci.org/antvis/g-ecs)
![](https://img.shields.io/badge/language-javascript-red.svg)
![](https://img.shields.io/badge/license-MIT-000000.svg)

## 问题背景

原本 `g-base` 中 `Element` 包含了很多属性以及对应操作逻辑，例如：

- 场景图/group
- RTS 矩阵运算
- 动画
- 裁剪
- 包围盒
- 其他样式属性（z-index、color...）
- 事件

导致 `g-canvas/svg/webgl` 扩展起来略显复杂。参考 [Data Oriented Programming](https://en.wikipedia.org/wiki/Entity_component_system)，我们将这些类型的数据和逻辑处理拆分成多组 `Component` 和 `System`，例如：

- SceneGraph 负责场景图
- Transform 负责 RTS 矩阵运算
- Geometry 保存几何信息
- Material 保存样式属性
- Mesh 保存包围盒，关联一个 Geometry 和 Material
- Culling 负责裁剪，仅渲染视口内对象
- Renderer 负责渲染，暴露统一渲染接口供 `g-canvas/svg/webgl/webgpu` 实现

## 架构

一个典型的 ECS 系统架构如下图（来自 ecsy），我们使用 `Matcher` 代替图中的 `Query`:

![](https://blog.mozvr.com/content/images/2019/10/ECSY-Architecture.svg)

## 使用方法

```javascript
import { Container } from 'inversify';
import { Component, System, World, containerModule } from '@antv/g-ecs';

// create a container
const container = new Container();
// load ECS module
container.load(containerModule);

// create a world
const world = container.get(World);

// register components
class C1 extends Component {
  static tag = 'c1';
  p1: number;
}
class C2 extends Component {
  static tag = 'c2';
}
class C3 extends Component {
  static tag = 'c3';
}
world.registerComponent(C1).registerComponent(C2).registerComponent(C3);

// register systems
class S1 extends System {
  static tag = 's1';

  trigger() {
    return new Matcher().allOf(C1);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const c1 = entity.getComponent(C1);
      c1.p1++;
    });
  }
}
world.registerSystem(S1);

// create an entity
const entity = world.createEntity();
entity.addComponent(C1, { p1: 2 }).addComponent(C2).addComponent(C3);

// make a loop
let lastTime = performance.now();
const run = () => {
  const time = performance.now();
  const delta = time - lastTime;
  // run all the systems
  world.execute(delta, time);

  lastTime = time;
  requestAnimationFrame(run);
};
run();
```

## World

`World` 是整个 ECS 系统的上下文，我们并不需要手动实例化它，从容器中获取即可。

```javascript
import { Container } from 'inversify';
import { World, containerModule } from '@antv/g-ecs';

// create a container
const container = new Container();
// load ECS module
container.load(containerModule);

// create a world
const world = container.get(World);
```

`World` 负责创建 `Entity`，注册 `Component` 以及 `System`。手动调用 `execute` 可以执行每个 `System` 中的逻辑，在一个图形渲染应用中，可以放在 `rAF` 中每一帧自动运行。

### createEntity

创建一个新的 `Entity`

```javascript
const entity = world.createEntity();
```

### registerComponent

注册一类 `Component`

```javascript
class C1 extends Component {
  static tag = 'c1';
  p1: number;
}
class C2 extends Component {
  static tag = 'c2';
}
class C3 extends Component {
  static tag = 'c3';
}
world.registerComponent(C1).registerComponent(C2).registerComponent(C3);
```

### registerSystem

注册一类 `System`，专注处理一类或者多类 `Component`

```javascript
class S1 extends System {
  static tag = 's1';

  trigger() {
    return new Matcher().allOf(C1);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const c1 = entity.getComponent(C1);
      c1.p1++;
    });
  }
}
world.registerSystem(S1);
```

### execute

手动调用可以执行每个 `System` 中的逻辑，在一个图形渲染应用中，可以放在 `rAF` 中每一帧自动运行。

```javascript
world.execute();
```

## Entitiy

## Component

## System

## Matcher

ECS 中的简单查询语言，供 `System` 过滤出包含自己感兴趣 `Component` 的所有实体：

- allOf 包含所有组件
- anyOf 包含组件之一
- noneOf 不包含所有组件
- matches 检测某个实体是否满足查询条件

```javascript
new Matcher().allOf(C1, C2).noneOf(C3);
```

## 参考资料

- [Data Oriented Programming](https://en.wikipedia.org/wiki/Entity_component_system)
- [ecsy](https://blog.mozvr.com/introducing-ecsy/)
- [Entitas](https://github.com/sschmid/Entitas-CSharp)
- [EntitasCookBook](https://github.com/mzaks/EntitasCookBook)
