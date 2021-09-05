---
title: Polygon 多边形
order: 7
---

如下 [示例](/zh/examples/shape#polygon) 定义了一个多边形：

```javascript
const polygon = new Polygon({
    style: {
        points: [
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
        ],
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
```

# 继承自

-   [DisplayObject](/zh/docs/api/basic/display-object)

默认锚点定义的位置为包围盒左上角顶点，可以通过 [anchor](/zh/docs/api/display-object#anchor) 改变。

# 额外属性

### points

**类型**： `[number, number][]`

**默认值**：无

**是否必须**：`true`
