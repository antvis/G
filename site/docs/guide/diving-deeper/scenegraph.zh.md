---
title: 场景图
order: 0
---

[场景图](https://zh.wikipedia.org/zh-cn/%E5%9C%BA%E6%99%AF%E5%9B%BE)（SceneGraph）是组织和管理二维/三维虚拟场景的一种数据结构，是一个有向无环图。场景图提供了两大能力：

1. 描述父子关系
2. 自动完成基于父子关系的某些复杂级联计算

在旧版 G 中我们在 `Group/Shape` 上提供了部分相关操作，但存在很多问题，导致上层在使用时存在很多 hack 手段。在新版中，我们参考了 DOM API 和 CSS 选择器，给场景图中的每个节点补全了以下能力，大幅降低学习成本：

1. 与 DOM API 风格一致的添加/删除节点/属性方法
2. 与 CSS 选择器类似的节点查询语法
3. 通过 `z-index` 控制展示次序
4. 通过 `visibility` 控制可见性

另外我们参考了 `react-three-fiber`，使用声明式语法定义场景图，便于组件复用。

## 太阳系的例子

试想我们需要构建一个简单的太阳系场景，具有以下层次关系：

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

在 G 中使用 `Group` 和 `Circle` 可以很容易构建出它们的层次关系：

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

⚠️ 此时我们并不需要使用到 `Canvas`，场景图是一种抽象的数据结构，只有在渲染时才需要与 `Canvas` 交互。

描述完层次关系，我们通常需要进一步定义场景图中对象的行为。在之前简单的太阳系模型中，我们希望让地球绕着太阳旋转，月亮绕着地球旋转，实时更新它们的位置属性，[DEMO](/en/examples/scenegraph#hierarchy)。但月球的轨迹（下图中红色虚线）计算似乎很复杂。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VDIfSJrf6xEAAAAAAAAAAAAAARQnAQ)

因此我们需要让月球只需要专心做“绕地球转”这件事，背后涉及父子关系的矩阵计算交给场景图完成。

## 变换

我们提供了平移、缩放和旋转这三种变换。其中每一种的值又可以分成相对和绝对两种，例如对于平移这种变换，平移到某一个点和基于当前点平移多少距离显然是不同的。和变换的量一样，**坐标系**同样具有相对和绝对的概念，这在之前版本的 G 中并没有解释的很清楚，缺少配套的 API，在使用时有诸多不便。

### 局部 VS 世界坐标系

坐标系可以用来描述场景中物体的位置、旋转和缩放情况，最著名的坐标系是欧式坐标系。在图形学中我们还会使用到重心坐标系。欧式空间可以包含 N 维，在可视化场景中我们只使用二维和三维。

当我们在说“月亮绕着地球转”的时候，实际上已经忽略了地球以外的对象。在月亮的**“局部坐标系”**中，它只是单纯地绕着一个点旋转而已，尽管在整个太阳系这个**“世界坐标系”**下，地球还在绕着太阳旋转，月球最终沿着上面那个复杂轨迹运动。

在二维和三维世界中，都可以使用局部坐标系和世界坐标系的概念，下图来自 [playcanvas](https://developer.playcanvas.com/en/tutorials/manipulating-entities/)，左侧为世界坐标系，右侧为局部坐标系： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kgaHRIYex8MAAAAAAAAAAAAAARQnAQ)

世界坐标系被整个场景图内的所有节点共享，因此它有一个固定的原点`(0, 0)`，XYZ 三轴（二维场景中为 XY 轴）的朝向也都是固定的，即使场景中的这个盒子自身发生了旋转，世界坐标系对它来说也不会变化。但对于自身的局部坐标系而言，它的原点首先就不再是 `(0, 0)` 而是物体自身的位置，坐标轴自然也发生了变化，顾名思义它和物体本身相关联。

试想此时我们让这个盒子“沿 X 轴（红色）平移 10 个单位”，在不同坐标系下含义完全不同。因此当我们想对一个物体进行变换时，首先要指明所处的坐标系。

另外，局部坐标系也被称作**模型坐标系**，在描述模型自身的变换时更方便。在[下图](https://bladecast.pro/blog/local-vs-world-space-why-two)中放置了两个士兵模型，如果我们想让每一个士兵转一下头，显然在局部坐标系做比较简单，因为“转动”这个变换就是相对于每个模型的头部而言的。 ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9B4FRo4UbNsAAAAAAAAAAAAAARQnAQ)

### 平移

对于平移操作，我们提供了局部/世界坐标系下，移动绝对/相对距离的 API：

| 名称             | 参数               | 返回值             | 备注                                   |
| ---------------- | ------------------ | ------------------ | -------------------------------------- |
| translate        | `[number, number]` | 无                 | 在 **世界坐标系** 下，相对当前位置移动 |
| translateLocal   | `[number, number]` | 无                 | 在 **局部坐标系** 下，相对当前位置移动 |
| setPosition      | `[number, number]` | 无                 | 设置 **世界坐标系** 下的位置           |
| setLocalPosition | `[number, number]` | 无                 | 设置 **局部坐标系** 下的位置           |
| getPosition      | 无                 | `[number, number]` | 获取 **世界坐标系** 下的位置           |
| getLocalPosition | 无                 | `[number, number]` | 获取 **局部坐标系** 下的位置           |

### 缩放

和平移不同，我们无法提供 `setScale` 这样设置世界坐标系下缩放的方法，因此全局坐标系下缩放是只读的，这在 Unity 中称之为 [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| 名称          | 参数               | 返回值             | 备注                                           |
| ------------- | ------------------ | ------------------ | ---------------------------------------------- |
| scaleLocal    | `[number, number]` | 无                 | 在 **局部坐标系** 下，相对当前缩放比例继续缩放 |
| setLocalScale | `[number, number]` | 无                 | 设置 **局部坐标系** 下的缩放比例               |
| getScale      | 无                 | `[number, number]` | 获取 **世界坐标系** 下的缩放比例               |
| getLocalScale | 无                 | `[number, number]` | 获取 **局部坐标系** 下的缩放比例               |

### 旋转

在 3D 场景中，旋转可以用矩阵、轴角、欧拉角和四元数表示，它们彼此之间可以互相转换。虽然考虑到未来的扩展性，在 G 内部实现中我们使用了四元数。

| 名称                | 参数     | 返回值   | 备注                                                                    |
| ------------------- | -------- | -------- | ----------------------------------------------------------------------- |
| rotateLocal         | `number` | 无       | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate              | `number` | 无       | 在 **世界坐标系** 下，旋转一定的欧拉角                                  |
| setEulerAngles      | `number` | 无       | 设置 **世界坐标系** 下的欧拉角                                          |
| setLocalEulerAngles | `number` | 无       | 设置 **局部坐标系** 下的欧拉角                                          |
| setLocalRotation    | `quat`   | 无       | 设置 **局部坐标系** 下的四元数                                          |
| setRotation         | `quat`   | 无       | 设置 **世界坐标系** 下的四元数                                          |
| getEulerAngles      | 无       | `number` | 获取 **世界坐标系** 下的欧拉角                                          |
| getLocalEulerAngles | 无       | `number` | 获取 **局部坐标系** 下的欧拉角                                          |
| getLocalRotation    | 无       | `quat`   | 获取 **局部坐标系** 下的四元数                                          |
| getRotation         | 无       | `quat`   | 获取 **世界坐标系** 下的四元数                                          |

上面的旋转方法都以自身位置为旋转中心，如果我们想让节点绕任意一个点旋转，可以给它创建一个父节点，将父节点移动到某个点后再旋转：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VE3bSZ7RFlQAAAAAAAAAAAAAARQnAQ)

下面我们会完成上述太阳系的例子，让地球绕着太阳旋转，让月亮绕着地球旋转。

### 完成太阳系的例子

首先设置太阳系在世界坐标系下的位置，基于场景图内的父子关系，太阳、地球轨道、地球、月球轨道和月球都被移动到了 `(300, 250)`，如下图（左）所示：

```javascript
// 设置太阳系的位置
solarSystem.setPosition(300, 250);
```

保持太阳位置不变，我们沿 X 轴移动地球轨道 100，同样地球、月球轨道和月球也都被移动到了世界坐标系下`(400, 250)`，如下图（中）所示：

```javascript
earthOrbit.translate(100, 0);
// earthOrbit.getLocalPosition() --> (100, 0)
// earthOrbit.getPosition() --> (400, 250)
```

然后我们移动月球轨道，如下图（右）所示：

```javascript
moonOrbit.translate(100, 0);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XcUqQJowVKMAAAAAAAAAAAAAARQnAQ)

最后在每一帧中，我们分别让太阳系和地球轨道在局部坐标系中沿 Z 轴旋转 1 度（你也可以让地球轨道转的更快点）：

```javascript
solarSystem.rotateLocal(1);
earthOrbit.rotateLocal(1);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZcrHSoLxRS8AAAAAAAAAAAAAARQnAQ)

对于每个节点来说，只需要使用上述变换方法，就像月球只需要绕着地球转，场景图在背后会依据父子关系计算出世界坐标系下它的位置。因此我们不建议使用类似 `get/setMatrix()` 这样手动设置矩阵的方法。

## 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。为此，我们参考 DOM API 中的 [Node 接口](https://developer.mozilla.org/en-US/docs/Web/API/Node) 在节点上定义了一系列属性与方法，同时提供了类似 CSS 选择器的节点查询方法，最大程度减少学习成本。

### 简单节点查询

| 名称            | 属性/方法 | 返回值         | 备注                                 |
| --------------- | --------- | -------------- | ------------------------------------ |
| parentNode      | 属性      | `Group / null` | 父节点（如有）                       |
| children        | 属性      | `Group[]`      | 子节点列表                           |
| firstChild      | 属性      | `Group / null` | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `Group / null` | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `Group / null` | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `Group / null` | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean`      | 子树中是否包含某个节点（入参）       |

### 高级查询

参考 CSS 选择器，我们提供了以下查询方法，查询范围是当前节点的**整棵子树**，并不仅仅是直接的子节点列表，而是所有子孙节点。

| 名称                   | 参数                  | 返回值          | 备注                            |
| ---------------------- | --------------------- | --------------- | ------------------------------- |
| getElementById         | `(id: string)`        | `Group / null`  | 通过 `id` 查询子节点            |
| getElementsByName      | `(name: string)`      | `Group[]`       | 通过 `name` 查询子节点列表      |
| getElementsByClassName | `(className: string)` | `Group[]`       | 通过 `className` 查询子节点列表 |
| getElementsByTagName   | `(tagName: string)`   | `Group[]`       | 通过 `tagName` 查询子节点列表   |
| querySelector          | `(selector: string)`  | `Group / null`  | 查询满足条件的第一个子节点      |
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

| 名称         | 参数                         | 返回值       | 备注                 |
| ------------ | ---------------------------- | ------------ | -------------------- |
| getAttribute | `(name: string)`             | `null / any` | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无           | 设置属性值           |

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
