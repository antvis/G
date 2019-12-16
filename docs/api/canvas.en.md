---
title: Canvas
order: 1
---

## 属性

### 通用的 [元素属性](/zh/docs/api/element#通用属性)

### width: number

- 画布宽度；

### height: number

- 画布高度；

### container: number | HTMLElement

- 画布容器，可以是容器 `id` 或者 DOM 元素；

### renderer: Renderer (只读属性)

> ⚠️ 注意，该属性为只读属性，不能动态修改。

- 当前使用的渲染引擎，其中 `Renderer` 的类型为:

```ts
export type Renderer = 'canvas' | 'svg';
```

### pixelRatio: number

- 画布大小和所占 DOM 宽高的比例，一般可以使用 `window.devicePixelRatio`，通常情况下无需手动设置该属性；

### cursor: Cursor

- 画布的 cursor 样式，其中 `Cursor` 为样式类型，可参考 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)。

## 方法

### 通用的 [元素方法](/zh/docs/api/element#通用方法)

### isCanvas()

- 是否为画布；

## getRenderer(): Renderer

- 获取渲染引擎，其中 `Renderer` 的类型为:

```ts
export type Renderer = 'canvas' | 'svg';
```

## getCursor(): Cursor

- 获取画布的 cursor 样式，其中 `Cursor` 为样式类型，可参考 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)。

## setCursor(cursor: Cursor)

- 设置画布的 cursor 样式，其中 `Cursor` 为样式类型，可参考 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)。

### add(element: Element)

- 添加并返回元素，其中 `element` 为构造好的元素对象；

### addShape(cfg: ShapeCfg)

- 添加并返回图形，其中 `cfg` 为图形配置项，具体说明如下:

```js
type ShapeCfg = {
  /* 图形 id */
  id?: string,
  /* 图形名称 */
  name?: string,
  /* 图形类型 */
  type?: string,
  /* 绘图属性 */
  attrs: {
    [key: string]
  },
  /* 层次索引，决定绘制的先后顺序 */
  zIndex?: number,
  /* 是否可见 */
  visible?: boolean,
  /* 是否可以拾取 */
  capture?: boolean,
  /* 其他属性 */
  [key: string]: any,
};
```

### addShape(type: string, cfg: ShapeCfg)

- 添加并返回图形，其中:
  - `type`: 图形类型；
  - `cfg`: 图形配置项，详情同上；

### addGroup()

- 添加并返回一个默认的图形分组；

### addGroup(cfg: GroupCfg)

- 添加并返回图形，其中 `cfg` 为图形分组配置项，具体说明如下：

```js
type ShapeCfg = {
  /* 图形分组 id */
  id?: string,
  /* 图形分组名称 */
  name?: string,
  /* 图形分组的绘图属性 */
  attrs: {
    [key: string]
  },
  /* 层次索引，决定绘制的先后顺序 */
  zIndex?: number,
  /* 是否可见 */
  visible?: boolean,
  /* 是否可以拾取 */
  capture?: boolean,
  /* 其他属性 */
  [key: string]: any,
};
```

### addGroup(groupClass: Group, cfg: ShapeCfg)

- 添加并返回特定类型的图形分组，其中:
  - `groupClass`: 图形分组 Class；
  - `cfg`: 图形分组配置项，详情同上；

### getParent()

- 获取父元素，对于 Canvas 来说为 `null`；

### getChildren()

- 获取所有的子元素；

### getShape(x: number, y: number);

- 根据画布坐标 `x` 和 `y` 获取对应的图形；

### sort()

- 子元素按照 `zIndex` 属性进行排序；

### clear()

- 清空所有的子元素；

### changeSize(width: number, height: number)

- 修改画布大小；

### getPointByClient(clientX: number, clientY: number)

- 根据窗口坐标，获取对应的画布坐标，返回类型为 `{ x: number, y: number }`；

### getClientByPoint(x: number, y: number)

- 根据画布坐标，获取对应的窗口坐标，返回类型为 `{ x: number, y: number }`；

### draw()

- 绘制方法，在 `自动渲染` 模式下无需手动调用，在 `手动渲染` 模式下需要手动调用；
