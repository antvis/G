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

```javascript
// 平移相对距离
line1.translate(100, 0);
// 或者，直接设置锚点位置
line1.setPosition(200 + 100, 0);
// 或者，直接移动两个端点
line1.attr({
    x1: 200 + 100,
    x2: 400 + 100,
});
```

# 继承自

-   [DisplayObject](/zh/docs/api/basic/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

# 额外属性

### x1

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### y1

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### x2

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### y2

<tag color="green" text="可应用动画">可应用动画</tag>

**类型**： `number`

**默认值**：无

**是否必须**：`true`

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
