---
title: Scene Graph
order: 0
---

The [SceneGraph](https://zh.wikipedia.org/zh-cn/%E5%9C%BA%E6%99%AF%E5%9B%BE) is a data structure for organizing and managing 2D/3D virtual scenes as a directed acyclic graph. SceneGraphs provide two major capabilities.

1. describe parent-child relationships
2. automate some complex cascade calculations based on parent-child relationships

In the old version of G, we provided some related operations on `Group/Shape`, but there were a lot of problems, which led to a lot of hacking at the upper level when using it. In the new version, we refer to the DOM API and CSS selector, and give each node in the scene graph the following capabilities to significantly reduce the learning cost.

1. add/remove node/property methods in the same style as the DOM API
2. node query syntax similar to CSS selector
3. `z-index` to control the display order
4. visibility control via `visibility

In addition, we refer to `react-three-fiber` to define the scene graph using declarative syntax for easy component reuse.

## Examples of solar systems

Imagine we need to construct a simple solar system scenario with the following hierarchical relationships.

```
太阳系 solarSystem
   |    |
   |   太阳 sun
   |
 地球轨道 earthOrbit
   |    |
   |  地球 earth
   |
 月球轨道 moonOrbit
      |
     月球 moon
```

Their hierarchy can be easily constructed in G using `Group` and `Circle`.

```javascript
import { Group, Circle } from '@antv/g';

const solarSystem = new Group({
    name: 'solarSystem',
});
const earthOrbit = new Group({
    name: 'earthOrbit',
});
const moonOrbit = new Group({
    name: 'moonOrbit',
});
const sun = new Circle({
    name: 'sun',
    style: {
        r: 100,
    },
});
const earth = new Circle({
    name: 'earth',
    style: {
        r: 50,
    },
});
const moon = new Circle({
    name: 'moon',
    style: {
        r: 25,
    },
});

solarSystem.appendChild(sun);
solarSystem.appendChild(earthOrbit);
earthOrbit.appendChild(earth);
earthOrbit.appendChild(moonOrbit);
moonOrbit.appendChild(moon);
```

⚠️ We don't need to use `Canvas` at this point, the scene graph is an abstract data structure that only needs to interact with `Canvas` when rendering.

After describing the hierarchical relationships, we usually need to further define the behavior of the objects in the scene graph. In the previous simple solar system model, we wanted to have the Earth rotate around the Sun and the Moon rotate around the Earth, updating their position properties in real time, [DEMO](/en/examples/scenegraph#hierarchy). However, the calculation of the moon's trajectory (red dashed line in the figure below) seems to be complicated.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VDIfSJrf6xEAAAAAAAAAAAAAARQnAQ)

Therefore, we need to let the moon just concentrate on the "orbiting the Earth", and leave the matrix calculation behind the parent-child relationship to the scene map.

## Transformation

We provide three types of transformations: translation, scaling and rotation. The values of each of these can be divided into relative and absolute. For example, for the translation transformation, there is obviously a difference between translating to a certain point and translating a distance based on the current point. Like the amount of transformation, the **coordinate system** also has the concept of relative and absolute, which was not clearly explained in the previous version of G. The lack of a supporting API makes it inconvenient to use.

### Local & World Coordinate systems

Coordinate systems can be used to describe the position, rotation, and scaling of objects in a scene; the most famous coordinate system is the Euclidean coordinate system. In graphics we also use the center of gravity coordinate system. Euclidean space can contain N dimensions, in visualization scenes we use only 2D and 3D.

When we say that "the moon revolves around the earth", we have actually ignored the objects outside the earth. In the **"local coordinate system "** of the Moon, it simply rotates around a point, although in the **"world coordinate system "** of the entire solar system, the Earth still rotates around the Sun, and the Moon eventually follows the complex trajectory above. motion.

The concepts of local and world coordinate systems can be used in both two and three dimensional worlds.

The following image is from [playcanvas](https://developer.playcanvas.com/en/tutorials/manipulating-entities/), with the world coordinate system on the left and the local coordinate system on the right.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kgaHRIYex8MAAAAAAAAAAAAAARQnAQ)

The world coordinate system is shared by all the nodes in the whole scene graph, so it has a fixed origin `(0, 0)` and the orientation of the XYZ axes (XY axes in 2D scene) is also fixed, even if the box in the scene rotates itself, the world coordinate system will not change for it. But for its own local coordinate system, its origin is no longer `(0, 0)` but the object's own position, and the axes naturally change, as the name implies, and are associated with the object itself.

Imagine at this point that we ask the box to "translate 10 units along the X-axis (red)", which has a completely different meaning in different coordinate systems. So when we want to transform an object, we first need to specify the coordinate system we are in.

In addition, the local coordinate system is also called **model coordinate system**, which is more convenient when describing the transformation of the model itself. In [the figure below](https://bladecast.pro/blog/local-vs-world-space-why-two) two soldier models are placed, and if we want to make each soldier turn his head a little, it is obviously simpler to do it in the local coordinate system, because the "turn " this transformation is relative to the head of each model.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9B4FRo4UbNsAAAAAAAAAAAAAARQnAQ)

### Translation

For translation operations, we provide APIs for moving absolute/relative distances in local/world coordinate systems.

| name             | params             | return value       | remarks                                                          |
| ---------------- | ------------------ | ------------------ | ---------------------------------------------------------------- |
| translate        | `[number, number]` | -                  | Move relative to current position in **world coordinate system** |
| translateLocal   | `[number, number]` | -                  | Move relative to current position in **local coordinate system** |
| setPosition      | `[number, number]` | -                  | Sets the position in the **world coordinate system**.            |
| setLocalPosition | `[number, number]` | -                  | Sets the position in the **local coordinate system**.            |
| getPosition      | -                  | `[number, number]` | Get the position in the **world coordinate system**              |
| getLocalPosition | -                  | `[number, number]` | Get the position in the **local coordinate system**              |

### Scaling

Unlike panning, we can't provide a method like `setScale` to set the scaling in the world coordinate system, so scaling in the global coordinate system is read-only, which is called [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/) in Unity.

| name          | params             | return value       | remarks                                                                            |
| ------------- | ------------------ | ------------------ | ---------------------------------------------------------------------------------- |
| scaleLocal    | `[number, number]` | -                  | Continued scaling with respect to the current scale in **local coordinate system** |
| setLocalScale | `[number, number]` | -                  | Set the scaling in **local coordinate system**                                     |
| getScale      | -                  | `[number, number]` | Get the scaling in **world coordinate system**                                     |
| getLocalScale | -                  | `[number, number]` | Get the scaling in **local coordinate system**                                     |

### Rotation

In 3D scenes, rotations can be represented as matrices, axis angles, Euler angles and quaternions, which are interconvertible with each other. Although, considering future scalability, we use quaternions in the G internal implementation.

| name                | params   | return value | remarks                                                                 |
| ------------------- | -------- | ------------ | ----------------------------------------------------------------------- |
| rotateLocal         | `number` | -            | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate              | `number` | -            | 在 **世界坐标系** 下，旋转一定的欧拉角                                  |
| setEulerAngles      | `number` | -            | 设置 **世界坐标系** 下的欧拉角                                          |
| setLocalEulerAngles | `number` | -            | 设置 **局部坐标系** 下的欧拉角                                          |
| setLocalRotation    | `quat`   | -            | 设置 **局部坐标系** 下的四元数                                          |
| setRotation         | `quat`   | -            | 设置 **世界坐标系** 下的四元数                                          |
| getEulerAngles      | -        | `number`     | 获取 **世界坐标系** 下的欧拉角                                          |
| getLocalEulerAngles | -        | `number`     | 获取 **局部坐标系** 下的欧拉角                                          |
| getLocalRotation    | -        | `quat`       | 获取 **局部坐标系** 下的四元数                                          |
| getRotation         | -        | `quat`       | 获取 **世界坐标系** 下的四元数                                          |

If we want to rotate a node around any point, we can create a parent node for it, move the parent node to a point and then rotate it.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VE3bSZ7RFlQAAAAAAAAAAAAAARQnAQ)

Below we will complete the above solar system example by having the Earth rotate around the Sun and having the Moon rotate around the Earth.

### Example of a completed solar system

First set the position of the solar system under the world coordinate system. Based on the parent-child relationship within the scene graph, the Sun, Earth's orbit, Earth, Moon's orbit and Moon are moved to `(300, 250)` as shown in the following figure (left).

```javascript
// 设置太阳系的位置
solarSystem.setPosition(300, 250);
```

Keeping the position of the Sun constant, we move the Earth's orbit by 100 along the X-axis, and similarly the Earth, the Moon's orbit and the Moon are all moved to `(400, 250)` under the world coordinate system, as shown in the following figure (center).

```javascript
earthOrbit.translate(100, 0);
// earthOrbit.getLocalPosition() --> (100, 0)
// earthOrbit.getPosition() --> (400, 250)
```

Then we move the lunar orbit, as shown in the following figure (right).

```javascript
moonOrbit.translate(100, 0);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XcUqQJowVKMAAAAAAAAAAAAAARQnAQ)

Finally, in each frame, we rotate the solar system and the Earth's orbit by 1 degree along the Z-axis in the local coordinate system (you can also make the Earth's orbit go faster).

```javascript
solarSystem.rotateLocal(1);
earthOrbit.rotateLocal(1);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZcrHSoLxRS8AAAAAAAAAAAAAARQnAQ)

For each node, it is only necessary to use the above transformation method, just like the moon only needs to orbit the earth, and the scene graph will calculate its position in the world coordinate system behind the scenes based on the parent-child relationship. Therefore we do not recommend to use methods like `get/setMatrix()` to set the matrix manually.

## 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。为此，我们参考 DOM API 中的 [Node 接口](https://developer.mozilla.org/en-US/docs/Web/API/Node) 在节点上定义了一系列属性与方法，同时提供了类似 CSS 选择器的节点查询方法，最大程度减少学习成本。

### 简单节点查询

| 名称            | 属性/方法 | 返回值    | 备注                           |
| --------------- | --------- | --------- | ------------------------------ | ------------------------------------ |
| parentNode      | 属性      | `Group    | null`                          | 父节点（如有）                       |
| children        | 属性      | `Group[]` | 子节点列表                     |
| firstChild      | 属性      | `Group    | null`                          | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `Group    | null`                          | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `Group    | null`                          | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `Group    | null`                          | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean` | 子树中是否包含某个节点（入参） |

### 高级查询

参考 CSS 选择器，我们提供了以下查询方法，查询范围是当前节点的**整棵子树**，并不仅仅是直接的子节点列表，而是所有子孙节点。

| 名称                   | 参数                  | 返回值          | 备注                            |
| ---------------------- | --------------------- | --------------- | ------------------------------- | -------------------- |
| getElementById         | `(id: string)`        | `Group          | null`                           | 通过 `id` 查询子节点 |
| getElementsByName      | `(name: string)`      | `Group[]`       | 通过 `name` 查询子节点列表      |
| getElementsByClassName | `(className: string)` | `Group[]`       | 通过 `className` 查询子节点列表 |
| getElementsByTagName   | `(tagName: string)`   | `Group[]`       | 通过 `tagName` 查询子节点列表   |
| querySelector          | `(selector: string)`  | `Group ｜ null` | 查询满足条件的第一个子节点      |
| querySelectorAll       | `(selector: string)`  | `Group[]`       | 查询满足条件的所有子节点列表    |

下面我们以上面太阳系的例子，演示如何使用这些查询方法。

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

### 添加/删除节点

| 名称         | 参数                                | 返回值  | 备注                                                 |
| ------------ | ----------------------------------- | ------- | ---------------------------------------------------- |
| appendChild  | `(group: Group)`                    | `Group` | 添加子节点，返回添加的节点                           |
| insertBefore | `(group: Group, reference?: Group)` | `Group` | 添加子节点，在某个子节点之前（如有），返回添加的节点 |
| removeChild  | `(group: Group)`                    | `Group` | 删除子节点，返回被删除的节点                         |

### 获取/设置属性值

| 名称         | 参数                         | 返回值 | 备注       |
| ------------ | ---------------------------- | ------ | ---------- | -------------------- |
| getAttribute | `(name: string)`             | `null  | any`       | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无     | 设置属性值 |

⚠️ 兼容旧版 `attr(name: string, value?: any)`，获取以及设置属性值。

## 可见性与渲染次序

### 隐藏/显示

| 名称 | 参数 | 返回值 | 备注     |
| ---- | ---- | ------ | -------- |
| hide | 无   | 无     | 隐藏节点 |
| show | 无   | 无     | 展示节点 |

另外我们也可以通过 `visibility` 属性控制：

```javascript
const group = new Group();

group.hide();
// or group.setAttribute('visibility', false);

group.show();
// or group.setAttribute('visibility', true);
```

### 渲染次序

类似 CSS，我们可以通过 `zIndex` 属性控制渲染次序，有两点需要注意：

1. 只会影响渲染顺序，并不会改变场景图中的节点结构
2. 只在当前上下文内生效

| 名称      | 参数     | 返回值 | 备注          |
| --------- | -------- | ------ | ------------- |
| setZIndex | `number` | 无     | 设置 `zIndex` |
| toFront   | 无       | 无     | 置顶          |
| toBack    | 无       | 无     | 置底          |

```javascript
const group = new Group();

group.setZIndex(100);
// or group.setAttribute('zIndex', 100);
```

## [WIP] React Fiber

场景图的层次结构非常适合使用声明式语法描述，参考 [react-three-fiber](https://github.com/pmndrs/react-three-fiber)，我们也可以为 G 实现一个 [React Renderer](https://reactjs.org/docs/codebase-overview.html#renderers)，它具有以下优势：

1. 声明式语法便于描述层次结构
2. 便于组件复用
3. 天生容易和 React 生态结合

### 定义组件

-   使用声明式语法定义场景图结构，省略了大量对于 `appendChild` 的手动调用
-   如果需要调用 `Group` 上的方法，可以使用 `useRef` 获取引用
-   提供例如 `useFrame` 这样的 hook，完成动画

```jsx
import React, { useRef, useState } from 'react';
import { Group, Circle, useFrame } from '@antv/react-g-fiber';

const SolarSystem = () => {
    // 创建对于 Group 的引用
    const solarSystem = useRef();
    const earthOrbit = useRef();

    // 每一帧调用
    useFrame(() => {
        solarSystem.rotateLocal(1);
        earthOrbit.rotateLocal(1);
    });

    const [hovered, setHover] = useState(false);

    return;
    <Group name="solarSystem" ref={solarSystem} position={[300, 250]}>
        <Circle name="sun" r={100} />
        <Group name="earthOrbit" ref={earthOrbit} localPosition={[100, 0]}>
            <Circle name="earth" r={50} />
            <Group name="moonOrbit" localPosition={[100, 0]}>
                <Circle
                    name="moon"
                    r={25}
                    fill={hovered ? 'yellow' : 'red'}
                    onPointerOver={(event) => setHover(true)}
                    onPointerOut={(event) => setHover(false)}
                />
            </Group>
        </Group>
    </Group>;
};
```

### 渲染组件

在渲染组件时才需要指定渲染引擎：

```jsx
import ReactDOM from 'react-dom';
import { Canvas } from '@antv/react-g-fiber';
import { SolarSystem } from './SolarSystem';

ReactDOM.render(
    <Canvas width={600} height={500} renderer="webgl">
        <SolarSystem />
    </Canvas>,
    document.getElementById('root'),
);
```

### 与 HTML 联动

在实际使用中，如何将场景图中的节点与 HTML 结合是一个问题，尤其当 HTML 变得复杂时，就不仅仅是一个 HUD 问题了：

-   Canvas/WebGL 可以渲染类似按钮这样的简单组件，但类似输入框、表单这样的复杂组件成本太高
-   SVG 虽然可以使用 [foreignObject](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject)，兼顾基础图形和 HTML 的渲染，但存在性能问题

因此我们应该让渲染引擎做它们擅长的事情：让 Canvas/WebGL 高效地绘制基础图形，让 HTML 来渲染复杂组件。两者之间的**联动**才是我们该关心的问题。

参考 [drei](https://github.com/pmndrs/drei#html) 我们可以提供一个 HTML 容器节点。在渲染时该节点会被 G 跳过，但它的位置依然会通过场景图计算，只是最终通过修改 CSS 样式生效：

```jsx
import { Group, Circle, Html } from '@antv/react-g-fiber';

const SolarSystem = () => (
    <Group>
        <Circle r={100} />
        <Html prepend>
            <h1>hello</h1>
            <p>world</p>
        </Html>
    </Group>
);
```

该容器中的内容会添加在 `<canvas>` 之后。但毕竟是特殊节点，一些会功能受限，例如：

-   无法通过 `z-index` 让它夹在两个 `Circle` 之间
-   无法在内部嵌套其他基础图形节点

## WIP 结合 D3 生态

选择兼容 DOM API 与 CSS 选择器，除了降低学习成本，还有一个很大的好处，那就是很容易与一些已有生态结合，例如 D3，因为大家的节点定义都是基于统一的接口。

SpriteJS 就是这么做的，节点描述、处理逻辑仍由 D3 完成，渲染则替换成了自身实现的 Canvas/WebGL： https://spritejs.org/demo/#/d3/bar

## 旧版兼容

虽然旧版 G 4.0 中提供的场景图相关功能并不完整，但毕竟上层 G2、G6 也使用了一部分 API，我们会尽可能兼容它们。

### 变换相关

由于之前变换方法不全，因此 G6 使用了 `@antv/matrix-util`，让用户可以通过 `get/setMatrix` 直接操作变换矩阵：

```javascript
import { transform } from '@antv/matrix-util';
transform(m, [
    ['t', x, y], // translate with vector (x, y)
    ['r', Math.PI], // rotate
    ['s', 2, 2], // scale at x-axis and y-axis
]);
```

我们建议去除该依赖，直接使用节点的变换方法：

```javascript
group
    .translate(x, y)
    .rotateLocal(180) // rotate in degrees
    .scaleLocal(2, 2);
```

### 节点定义

场景图应该能够脱离渲染引擎存在，这样在描述组件时才不需要考虑具体渲染引擎（`g-canvas/svg/webgl`）。因此不再建议使用 `canvas.addGroup` 和 `canvas.addShape` 这样的方法。

```javascript
// 不建议使用旧版
import { Canvas } from 'g-canvas';
const canvas = new Canvas();
const circle = canvas.addShape('circle', { style: { r: 25 } });

// 建议使用新版
// 定义组件
import { Circle, Canvas } from '@antv/g';
const circle = new Circle({ style: { r: 25 } });
// 渲染组件
const canvas = new Canvas({});
canvas.appendChild(circle);
```

### 节点查询

G6 使用了 `find` 方法查询符合条件的节点：

```javascript
group.find((element) => element.get('className') === 'link-point-left');
```

这类简单的查询可以使用 `getElementsByClassName` 或者 `queryAllSelector` 代替：

```javascript
group.getElementsByClassName('link-point-left');
// or
group.queryAllSelector('.link-point-left');
```

但要注意，和 DOM API 一致，查询范围不仅仅局限在直接的子节点列表，而是一整棵子树。

### 可见性与渲染次序

修复了旧版 `z-index` 的 bug，API 不变。

## 参考资料

-   [World vs Local Space. Why do we need them both?](https://bladecast.pro/blog/local-vs-world-space-why-two)
-   [PlayCanvas Docs - Manipulating Entities](https://developer.playcanvas.com/en/tutorials/manipulating-entities/)
-   [What dose 'lossyScale' actually means?](https://answers.unity.com/questions/456669/what-dose-lossyscale-actually-means.html)
