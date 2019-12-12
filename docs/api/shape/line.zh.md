---
title: Line 直线
order: 9
---

# 属性

- 详见 [图形属性](/zh/docs/api/shape/api#属性)；

## attrs 绘图属性

> 通用的 [绘图属性](/zh/docs/api/shape/attrs)

### x1

- 起始点的 x 坐标；

### y1

- 起始点的 y 坐标；

### x2

- 结束点的 x 坐标；

### y2

- 结束点的 y 坐标；

## 方法

### 通用的 [图形方法](/zh/docs/api/shape#方法)

### getTotalLength(): number

- 获取路径长度；

### getPoint(ratio: number): Point

- 根据长度比例获取点，其中 `Point` 的格式为:

```ts
export type Point = {
  x: number;
  y: number;
};
```
