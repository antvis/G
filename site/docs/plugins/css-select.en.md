---
title: g-plugin-css-select
order: 0
---

When finding nodes in the scene graph, we can use some [advanced query methods](/en/api/basic/display-object#advanced-query) similar to the DOM API.

-   **getElementById** Find a single element by id in the subtree of the current node
-   **getElementsByName** Find a list of elements by name in the subtree of the current node
-   **getElementsByClassName** Find a list of elements by className under the subtree of the current node
-   **getElementsByTagName** Find a list of elements by tagName under the subtree of the current node

Suppose we construct the following scenegraph.

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

We can use the following query methods.

```javascript
solarSystem.getElementsByName('sun');
// [sun]

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]
```

When we want to use more complex query criteria like CSS selectors, we have the option to install the plugin.

-   **querySelector**
-   **querySelectorAll**

Once the installation is complete the attribute selector can be used.

```js
solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

## Usage

Create plug-ins and register them in the renderer.

```js
import { Plugin } from '@antv/g-plugin-css-select';
webglRenderer.registerPlugin(new Plugin());
```

We can use something like the DOM API + CSS selector for node queries in the scene graph, [full example](/en/examples/plugins#css-select).

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
