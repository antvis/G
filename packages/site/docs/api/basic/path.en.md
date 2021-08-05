---
title: Path 路径
order: 8
---

使用 Path 可以定义直线、折线、圆弧、贝塞尔曲线等。

如下 [示例](/zh/examples/shape#path) 定义了一条直线：

```javascript
const line = new Path({
  attrs: {
    path: [
      ['M', 100, 100],
      ['L', 200, 200],
    ],
    stroke: '#F04864',
  },
});
```

# 继承自

- [DisplayObject](/zh/docs/api/basic/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

# 额外属性

### path

路径，支持 `字符串`和 `数组` 两种形式，可参考 [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)：
* 字符串形式: `M 100,100 L 200,200`
* 数组形式: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ] ]`

**类型**： `string | [string, number, number][]`

**默认值**：无

**是否必须**：`true`

# 方法

## getTotalLength(): number

获取路径长度。

https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGeometryElement/getTotalLength

## getPoint(ratio: number): Point

根据长度比例（取值范围 `[0-1]`）获取点，其中 `Point` 的格式为:

```ts
export type Point = {
  x: number;
  y: number;
};
```

