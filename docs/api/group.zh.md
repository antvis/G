---
title: Group 图形分组
order: 2
---

## 属性

### 通用的 [元素属性](/zh/docs/api/element#通用属性)

## 方法

### 通用的 [元素方法](/zh/docs/api/element#通用方法)

### isCanvas()

- 是否为画布；

### getShapeBase()

- 获取图形的基类；

### getGroupBase()

- 获取图形分组的基类；

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

- 获取父元素；

### getChildren()

- 获取所有的子元素；

### getShape(x: number, y: number);

- 根据画布坐标 `x` 和 `y` 获取对应的图形；

### sort()

- 子元素按照 `zIndex` 属性进行排序；

### clear()

- 清空所有的子元素；

## 工具方法

### getFirst()

- 获取第一个子元素；

### getLast()

- 获取最后一个子元素；

### getCount()

- 获取子元素的数量；

### findAll(fn: element => boolean)

- 查找所有匹配的元素，其中 `fn` 为查找函数；

### findById(id: string)

- 根据元素 `id` 查找元素；

### find(fn: element => boolean)

- 查找第一个符合条件的元素，其中 `fn` 为查找函数；
