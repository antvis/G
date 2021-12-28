---
title: Line 直线
order: 6
---

如下 [示例](/zh/examples/shape#line) 定义了一条直线，两个端点分别为 `[200, 100]` 和 `[400, 100]`，线宽为 2，而且是一条虚线：

```javascript
const line1 = new Line({
    style: {
        x1: 200,
        y1: 100,
        x2: 400,
        y2: 100,
        stroke: '#1890FF',
        lineWidth: 2,
        lineDash: [10, 10],
    },
});
```

对于直线，默认锚点定义的位置为包围盒左上角顶点，其中两个端点坐标 `[x1, y1]` `[x2, y2]` 定义在局部坐标系下，因此如果此时获取该直线在局部坐标系的坐标，会得到 `[x1, y1]` 的坐标，即 `[200, 100]`：

```js
line1.getLocalPosition(); // [200, 100]
```

对于上面的直线为 `(200, 100)`。当我们想沿 X 轴向右移动该直线 100 距离时，可以有以下三种做法：

-   使用 translate 在世界坐标系下平移一段相对距离
-   使用 setPosition 设置世界坐标系下的绝对坐标
-   直接修改直线定义中的 x1/x2 属性

```javascript
// 平移相对距离，此时 x1/x2 不变
line1.translate(100, 0);
// 或者，直接设置锚点位置
line1.setPosition(200 + 100, 0);
// 或者，直接移动两个端点
line1.attr({
    x1: 200 + 100,
    x2: 400 + 100,
});
```

如果想更改默认的锚点位置，可以通过 `anchor` 属性修改，例如把直线的中点作为锚点，此时直线局部坐标系下的坐标不变，但会把锚点移动到 `[200, 100]`，因此展示效果会发生改变：

```js
line.style.anchor = [0.5, 0.5];
line.getLocalPosition(); // [200, 100]
```

# 继承自

-   [DisplayObject](/zh/docs/api/basic/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

# 额外属性

## x1

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

## y1

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

## z1

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`false`

## x2

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

## y2

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

## z2

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`false`

## isBillboard

3D 场景中生效，始终朝向屏幕，因此线宽不受透视投影影像。[示例](/zh/examples/3d#force-3d)

**类型**： `boolean`

**默认值**：`false`

**是否必须**：`false`

# 方法

## getTotalLength(): number

获取直线长度。

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

```js
line.getTotalLength(); // 200
```

## getPoint(ratio: number): Point

根据长度比例（取值范围 `[0-1]`）获取直线上局部坐标系下的点坐标，其中 `Point` 的格式为:

```ts
export type Point = {
    x: number;
    y: number;
};
```

例如获取上面定义直线的中点：

```js
line.getPoint(0.5); // Point {x: 300, y: 100}
```

# 3D 场景中的线

需要配合 `g-webgl` 渲染器与 `g-plugin-3d` 插件使用。

将端点坐标拓展到三维：

```js
new Line({
    style: {
        x1: 200,
        y1: 100,
        z1: 0, // Z 轴坐标
        x2: 400,
        y2: 100,
        z2: 100, // Z 轴坐标
    },
});
```

2D 的线在正交投影下可以保证一致的宽度，但是在透视投影下就无法保证了。在某些需要时刻保持线宽一致的 3D 场景下，可以开启 [isBillboard](/zh/docs/api/basic/line#isbillboard)，[示例](/zh/examples/3d#force-3d)
