---
title: Path 路径
order: 12
---

# 属性

- 详见 [图形属性](/zh/docs/api/shape/api#属性)；

## attrs 绘图属性

> 通用的 [绘图属性](/zh/docs/api/shape/attrs)

### path

- 路径，支持 `字符串`和 `数组` 两种形式，详情可以参考 [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)。
  - 字符串形式: `M 100,100 L 200,200`
  - 数组形式: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ] ]`

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

> 当前只有 Canvas 版本支持

- 获取起点的切向量，形如: `[[10, 10], [20, 20]]`；

### getEndTangent(): number[][]

> 当前只有 Canvas 版本支持

- 获取终点的切向量，形如: `[[10, 10], [20, 20]]`；
