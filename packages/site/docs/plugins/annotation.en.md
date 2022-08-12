---
title: g-plugin-annotation
order: -1
---

除了把图形渲染出来，有时我们还希望以交互形式对图形进行缩放等变换，例如 [Fabric.js](http://fabricjs.com/) 和 [Konva.js](https://konvajs.org/) 就提供了这样的能力。以下图为例，鼠标选中图形后，会出现辅助操作的控件，可以通过拖拽蒙层移动目标图形，也可以通过拖拽锚点对图形进行缩放：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zXxcR4O7aHQAAAAAAAAAAAAAARQnAQ" alt="selectable UI" width="200">

[示例](/en/examples/plugins#annotation)

# 安装方式

该插件依赖 [g-plugin-dragndrop](/en/docs/plugins/dragndrop) 提供的拖拽能力，因此在使用时需要同时注册：

```js
import { Plugin as PluginDragndrop } from '@antv/g-plugin-dragndrop';
import { Plugin as PluginAnnotation } from '@antv/g-plugin-annotation';

renderer.registerPlugin(new PluginDragndrop());
renderer.registerPlugin(new PluginAnnotation());
```

# 使用方式

通过开启 `selectable` 可以让基础图形具备交互功能：

```js
circle.style.selectable = true;
```

目前我们支持以下**基础图形**：[Circle](/en/docs/api/basic/circle)、[Ellipse](/en/docs/api/basic/ellipse)、[Rect](/en/docs/api/basic/rect)、[Image](/en/docs/api/basic/image)、[Line](/en/docs/api/basic/line)、[Polyline](/en/docs/api/basic/polyline)

## 选中图形

选中一个可交互图形有以下两种方式：

-   点击图形。这也是最常见的方式。
-   通过 API 方式选中图形，调用 [selectDisplayObject](/en/docs/plugins/annotation#selectdisplayobject) 方法。

图形被选中后会在上面出现一个蒙层，蒙层中包含若干锚点。

另外我们支持按住 `shift` 配合点击实现多选。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*i4jHQ6a8ZzMAAAAAAAAAAAAAARQnAQ" alt="multi-select" width="200">

## 取消选中图形

和选中图形相对，取消选中也有两种方式：

-   点击画布空白区域或者另一个图形。
-   通过 API 方式取消选中图形，调用 [deselectDisplayObject](/en/docs/plugins/annotation#deselectdisplayobject) 方法。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gLusRqf4zmQAAAAAAAAAAAAAARQnAQ" alt="deselect target" width="200">

## 移动图形

选中图形后，在蒙层上拖拽即可实现图形移动：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rC-ERaSSrmcAAAAAAAAAAAAAARQnAQ" alt="move target">

在移动过程中以及移动完毕后会触发相应 [事件]()。

## 改变图形大小

拖拽锚点可以改变图形的大小。以下图为例，拖拽右下角的锚点时，实际上是先固定了左上角，再修改图片的宽高。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gmraRLDxW_kAAAAAAAAAAAAAARQnAQ" alt="resize target">

# 插件初始化配置

在创建插件时，可以传入一些初始化配置。

## 辅助操作组件样式

辅助操作组件的部分样式支持自定义，因此可以在初始化时传入样式配置，例如将蒙层的填充色变成黑色：

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionFill: 'black',
    },
});
```

目前我们支持的样式配置如下：

```js
export interface SelectableStyle {
    /**
     * 蒙层
     */
    selectionFill: string;
    selectionFillOpacity: number;
    selectionStroke: string;
    selectionStrokeOpacity: number;
    selectionStrokeWidth: number;
    /**
     * 锚点
     */
    anchorFill: string;
    anchorStroke: string;
    anchorSize: string | number;
    anchorFillOpacity: number;
    anchorStrokeOpacity: number;
}
```

除了在初始化插件时指定，后续也可以随时使用 [updateSelectableStyle](/en/docs/plugins/annotation#updateselectablestyle) 方法修改。

### selectionFill

蒙层填充色，可以参考 [fill](/en/docs/api/basic/display-object#fill) 的取值，例如：

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionFill: 'rgba(0, 0, 0, 0.5)',
    },
});
```

### selectionFillOpacity

蒙层填充色透明度，可以参考 [fillOpacity](/en/docs/api/basic/display-object#fillopacity) 的取值。

### selectionStroke

蒙层描边颜色。可以参考 [stroke](/en/docs/api/basic/display-object#stroke) 的取值。

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionStroke: 'rgba(0, 0, 0, 0.5)',
    },
});
```

### selectionStrokeOpacity

蒙层描边透明度，可以参考 [strokeOpacity](/en/docs/api/basic/display-object#strokeopacity) 的取值。

### selectionStrokeWidth

蒙层描边线宽。可以参考 [strokeWidth](/en/docs/api/basic/display-object#strokewidth) 的取值。

### anchorFill

锚点填充色。

### anchorFillOpacity

锚点填充色透明度。

### anchorStroke

锚点描边色。

### anchorStrokeOpacity

锚点描边色透明度。

### anchorSize

锚点尺寸。暂时我们仅支持圆形锚点，因此该属性等同于圆的半径。

# API

以下 API 可以通过插件实例调用，例如：

```js
const plugin = new PluginAnnotation();

circle.style.selectable = true;
plugin.selectDisplayObject(circle);
```

## selectDisplayObject

选中一个图形。并不会对其他已选择的图形应用取消操作。

```js
plugin.selectedDisplayObject(circle);
```

## deselectDisplayObject

取消选中一个图形。

```js
plugin.deselectedDisplayObject(circle);
```

## getSelectedDisplayObjects

获取当前选中的图形列表。

```js
plugin.getSelectedDisplayObjects(); // [circle, path]
```

## updateSelectableStyle

实时更新交互组件的[样式](/en/docs/plugins/annotation#辅助操作组件样式)，例如在 [示例](/en/examples/plugins#annotation) 中修改蒙层填充色：

```js
plugin.updateSelectableStyle({
    selectionFill: 'red',
});
```

# 事件

当图形被选中、取消选中、移动、改变尺寸时，会触发对应事件。

```js
export enum SelectableEvent {
  SELECTED = 'selected',
  DESELECTED = 'deselected',
  MODIFIED = 'modified',
  MOVED = 'moved',
  MOVING = 'moving',
}
```

## 选中事件

当目标图形被选中时触发。在 [示例](/en/examples/plugins#annotation) 中，我们监听了图片的选中事件：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('selected', () => {});
// or
image.addEventListener(SelectableEvent.SELECTED, () => {});
```

## 取消选中事件

当目标图形被取消选中时触发。在 [示例](/en/examples/plugins#annotation) 中，我们监听了图片的取消选中事件：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('deselected', () => {});
// or
image.addEventListener(SelectableEvent.DESELECTED, () => {});
```
