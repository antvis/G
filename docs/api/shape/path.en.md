---
title: Path
order: 12
---

# 属性

- 详见 [图形属性](/en/docs/api/shape/api#属性)；

## attrs 绘图属性

> 通用的 [绘图属性](/en/docs/api/shape/attrs)

### path

- 路径，支持 `字符串`和 `数组` 两种形式，详情可以参考 [SVG path](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)。
  - 字符串形式: `M 100,100 L 200,200`
  - 数组形式: `[ [ 'M', 100, 100 ], [ 'L', 200, 200 ] ]`

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
