---
title: Polyline 折线
order: 10
---

# 属性

- 详见 [图形属性](/zh/docs/api/shape/api#属性)；

## attrs 绘图属性

> 通用的 [绘图属性](/zh/docs/api/shape/attrs)

### points

- 形如 `[ [ x1, y1 ], [ x2, y2 ], ... ]` 的点集合；

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

### getStartTangent(): number[][]

- 获取起点的切向量，形如: `[[10, 10], [20, 20]]`；

### getEndTangent(): number[][]

- 获取终点的切向量，形如: `[[10, 10], [20, 20]]`；
