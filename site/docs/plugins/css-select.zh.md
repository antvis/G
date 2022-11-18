---
title: g-plugin-css-select
order: 0
---

在场景图中查找节点时，我们可以使用一些类似 DOM API 的[高级查询方式](/zh/api/basic/display-object#高级查询)：

-   **getElementById** 在当前节点子树下按 id 查找单一元素
-   **getElementsByName** 在当前节点子树下按 name 查找元素列表
-   **getElementsByClassName** 在当前节点子树下按 className 查找元素列表
-   **getElementsByTagName** 在当前节点子树下按 tagName 查找元素列表

假设我们构建了如下场景图：

```
solarSystem<Group>
   |    |
   |   sun<Circle name='sun' />
   |
 earthOrbit<Group>
   |    |
   |  earth<Circle>
   |
 moonOrbit<Group>
      |
     moon<Circle r='25' />
```

我们可以使用以上查询方法：

```javascript
solarSystem.getElementsByName('sun');
// [sun]

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]
```

当我们想使用类似 CSS 选择器这样更复杂的查询条件时，就可以选择安装该插件：

-   **querySelector**
-   **querySelectorAll**

安装完成后就可以使用属性选择器：

```js
solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

## 安装方式

任意渲染器（g-canvas/g-svg/g-webgl）都可以使用该插件：

```js
import { Plugin } from '@antv/g-plugin-css-select';
// 注册插件
webglRenderer.registerPlugin(new Plugin());
```

## 使用方式

我们可以使用类似 DOM API + CSS 选择器的方式进行场景图中的节点查询，[完整示例](/zh/examples/plugins#css-select)：

```javascript
solarSystem.getElementsByName('sun');
// [sun]

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

<!-- <playground path='examples/plugins/demo/css-select.js' rid='container'></playground> -->
