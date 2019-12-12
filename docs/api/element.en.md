---
title: Element
order: 0
redirect_from:
  - /en/docs/api
---

# 通用属性

## id: string

- 元素 `id`；

## name: string

- 元素名称；

## visible: boolean

- 元素是否可见；

## capture: boolean

- 是否可以被拾取；

## destroyed: boolean

- 元素是否被销毁；

## zIndex: number

- 层次索引值，决定元素决定绘制的先后顺序；

## attrs: Object

- [绘图属性](/zh/docs/api/shape/attrs)；

# 通用方法

## 属性类方法

### get(name)

- 获取属性；

### set(name, value)

- 设置属性；

### attr()

- 获取全部图形属性；

### attr(name)

- 获取单个图形属性；

### attr(name, value)

- 设置图形属性；

### getParent()

- 获取父元素；

### getCanvas()

- 获取画布；

### isGroup()

- 是否为图形分组；

### getBBox()

- 获取元素包围盒，这个包围盒是相对于图形元素自己，不会将 `matrix` 计算在内；

### getCanvasBBox()

- 获取元素相对画布的包围盒，会将从顶层到当前元素的 `matrix` 都计算在内；

### getClip()

- 获取裁剪对象；

### setClip(clip)

- 设置并返回裁剪对象；

### isClipped(refX, refY)

- 相对于元素的坐标点是否被裁剪掉；

## 操作类方法

### clone()

- 复制元素；

### show()

- 显示元素；

### hide()

- 隐藏元素；

### toFront()

- 将元素层级放置最前面；

### toBack()

- 将元素层级放置最后面；

### destroy()

- 销毁元素；

### remove(destroyed?)

- 将元素从父元素中移除，`destroyed` 表示移除的同时是否销毁元素，默认为 `true`；

## 矩阵方法

### getMatrix()

- 获取矩阵；

### setMatrix(matrix)

- 设置矩阵；

### resetMatrix(matrix)

- 重置矩阵；

### applyToMatrix(vector)

- 将当前矩阵应用到向量 `vector` 上；

### invertFromMatrix

- 根据当前矩阵，将向量转换相对于 `图形` 或 `图形分组` 的位置；

### getTotalMatrix()

- 获取总的矩阵，会将父元素的矩阵计算在内；

### applyMatrix(matrix)

- 应用父元素的矩阵，用以计算当前元素总的矩阵；

## 事件方法

### on(eventType, callback, once?)

- 监听事件，参数说明如下:
  - `eventType: string`: 事件类型
  - `callback: ev => void`: 事件触发时的回调函数
  - `once?: boolean`: 是否只监听一次
- G 支持的浏览器事件类型如下：
  - mousedown
  - mouseup
  - dblclick
  - mouseout
  - mouseover
  - mousemove
  - mouseleave
  - mouseenter
  - touchstart
  - touchmove
  - touchend
  - dragenter
  - dragover
  - dragleave
  - drop
  - contextmenu
- 事件对象 `ev` 的属性值：
  - `type`: 事件类型
  - `name`: 事件名称
  - `x`: 画布上的 x 坐标
  - `y`: 画布上的 y 坐标
  - `clientX`: 窗口上的 x 坐标
  - `clientY`: 窗口上的 y 坐标
  - `bubbles`: 是否允许冒泡
  - `target`: 事件的触发对象
  - `currentTarget`: 事件的监听对象
  - `delegateTarget`: 事件的委托对象
  - `delegateObject`: 委托事件监听对象的 `delegateObject` 属性值，即 `ev.delegateObject = ev.currentTarget.get('delegateObject')`
  - `defaultPrevented`: 是否阻止了原生事件
  - `propagationStopped`: 是否阻止传播（向上冒泡）
  - `shape`: 触发事件的图形
  - `fromShape`: 开始触发事件的图形
  - `toShape`: 事件结束时的触发图形
  - `timeStamp`: 触发事件的时间
  - `domEvent`: 触发时的浏览器事件对象
  - `propagationPath`: 触发事件的路径

### once(eventType, callback)

- 监听一次事件；

### emit(eventType, ev)

- 触发事件；

### emitDelegation(eventType, ev)

- 触发委托事件；

### off()

- 取消监听全部事件；

### off(eventType, callback?)

- 取消监听事件；

### getEvents()

- 获取当前所有的事件

## 动画方法

### animate(toAttrs, animateCfg)

- 执行动画，参数说明如下：
- `toAttrs`: 动画最终状态，即最终的绘图属性值(注意: 渐变色不支持动画，而是直接生效)
- `animateCfg`: 动画配置，具体配置项如下:
  - `delay`: 动画执行的延迟时间
  - `duration`: 动画执行时间
  - `easing`: 动画缓动效果
  - `repeat`: 是否重复执行动画
  - `callback`: 动画执行完时的回调函数
  - `pauseCallback`: 动画暂停时的回调函数
  - `resumeCallback`: 动画恢复时的回调函数
- 示例:

```js
element.animate(
  {
    x: 100,
    y: 100,
    color: '#FF0000',
    matrix: [1, 0, 0, 1, 1, 0, 0, 1, 1],
  },
  {
    delay: 100,
    duration: 2000,
    easing: 'easeLinear',
    repeat: true,
    callback: () => {},
    pauseCallback: () => {},
    resumeCallback: () => {},
  }
);
```

### animate(onFrame, animateCfg)

- 执行动画，参数说明如下：
  - `onFrame: ratio => toAttrs`: 帧动画函数，通过定制 `onFrame` 函数可自定义帧动画。其中 `ratio` 为动画执行的比例，函数的返回值为动画最终状态 `toAttrs`；
  - `animateCfg`: 同上；
- 示例：将元素从坐标为 `(20, 20)` 的位置移动到坐标为 `(50, 50)` 的位置)

```js
element.animate(
  (ratio) => {
    return {
      x: 20 + (50 - 20) * ratio,
      y: 20 + (50 - 20) * ratio,
    };
  },
  {
    delay: 100,
    duration: 2000,
    easing: 'easeLinear',
    repeat: true,
    callback: () => {},
    pauseCallback: () => {},
    resumeCallback: () => {},
  }
);
```

### stopAnimate(toEnd?)

- 停止元素的动画，其中 `toEnd` 表示是否到动画的最终状态，默认为 `true`；

### pauseAnimate()

- 暂停元素的动画；

### resumeAnimate()

- 恢复元素暂停的动画；
