---
title: Line 直线
order: 6
---

如下 [示例](/zh/examples/shape#line) 定义了一条直线，两个端点为：

```javascript
const line1 = new Line({
  attrs: {
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

# 继承自

- [DisplayObject](/zh/docs/api/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

# 额外属性

### x1

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### y1

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### x2

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### y2

**类型**： `number`

**默认值**：无

**是否必须**：`true`

### lineDash

**类型**： `[number, number]`

**默认值**：无

**是否必须**：`false`

**虚线**
