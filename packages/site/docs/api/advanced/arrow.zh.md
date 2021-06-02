---
title: Arrow 箭头
order: 1
---

[示例](/zh/examples/shape#arrow)

```javascript
const lineArrow = new Arrow({
  attrs: {
    body: new Line({
      attrs: {
        x1: 200,
        y1: 100,
        x2: 0,
        y2: 0,
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
lineArrow.translate(200, 100);
```

# 继承自

- [DisplayObject](/zh/docs/api/basic/display-object)

# 额外属性

## body

**类型**： `Line | Polyline | Path`

**默认值**：无

**是否必须**：`true`

**说明**：箭头主体，支持传入 Line Polyline 或者 Path

```javascript
const lineArrow = new Arrow({
  attrs: {
    body: new Line({
      attrs: {
        x1: 200,
        y1: 100,
        x2: 0,
        y2: 0,
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
lineArrow.translate(200, 100);

const polylineArrow = new Arrow({
  attrs: {
    body: new Polyline({
      attrs: {
        points: [
          [0, 0],
          [50, 0],
          [50, 50],
          [100, 50],
          [100, 100],
          [150, 100],
        ],
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
polylineArrow.translate(200, 200);

const pathArrow = new Arrow({
  attrs: {
    body: new Path({
      attrs: {
        path: 'M 100,300' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80',
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
pathArrow.translate(100, 150);
```

## startHead

**类型**： `DisplayObject`

**默认值**：无

**是否必须**：`false`

**说明**：箭头起始端点

## endHead

**类型**： `DisplayObject`

**默认值**：无

**是否必须**：`false`

**说明**：箭头结束端点
