---
title: g-plugin-css-select
order: 0
---

# 安装方式

任意渲染器（g-canvas/g-svg/g-webgl）都可以使用该插件：

```js
import { containerModule } from '@antv/g-plugin-css-select';
// 注册插件
webglRenderer.registerPlugin(containerModule);
```

# 使用方式

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

我们可以使用类似 DOM API + CSS 选择器的方式进行场景图中的节点查询：

```javascript
solarSystem.getElementsByName('sun');
// [sun]

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(SHAPE.Circle);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```
