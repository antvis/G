---
title: Line
order: 9
---

# 属性

- 详见 [图形属性](/en/docs/api/shape/api#属性)；

## attrs 绘图属性

> 通用的 [绘图属性](/en/docs/api/shape/attrs)

### x1

- 起始点的 x 坐标；

### y1

- 起始点的 y 坐标；

### x2

- 结束点的 x 坐标；

### y2

- 结束点的 y 坐标；

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
