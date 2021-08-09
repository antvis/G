---
title: Rect 矩形
order: 4
---

如下 [示例](/zh/examples/shape#rect) 定义了一个圆角矩形，左上角顶点位置为 `(200, 100)`：

```javascript
const rect = new Rect({
  style: {
    x: 200,
    y: 100,
    width: 300,
    height: 200,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
  },
});
```

# 继承自

- [DisplayObject](/zh/docs/api/basic/display-object)

通过 `(x, y)` 定义的位置为左上角顶点。

# 额外属性

### width

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：宽度

### height

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：高度

### radius

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：圆角半径
