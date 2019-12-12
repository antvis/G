---
title: Polyline
order: 10
---

# 属性

- 详见 [图形属性](/en/docs/api/shape/api#属性)；

## attrs 绘图属性

> 通用的 [绘图属性](/en/docs/api/shape/attrs)

### points

- 形如 `[ [ x1, y1 ], [ x2, y2 ], ... ]` 的点集合；

## Method

### General [shape methods](/en/docs/api/shape#方法)

### getTotalLength(): number

- Get total length of path；

### getPoint(ratio: number): Point

- Get point according to ratio and the type of Point is shown below:

```ts
export type Point = {
  x: number;
  y: number;
};
```
