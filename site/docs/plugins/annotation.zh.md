---
title: g-plugin-annotation
order: -1
---

除了把图形渲染出来，有时我们还希望以交互形式对图形进行缩放等变换，例如 [Fabric.js](http://fabricjs.com/) 和 [Konva.js](https://konvajs.org/) 就提供了这样的能力。以下图为例，鼠标选中图形后，会出现辅助操作的控件，可以通过拖拽蒙层移动目标图形，也可以通过拖拽锚点对图形进行缩放：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zXxcR4O7aHQAAAAAAAAAAAAAARQnAQ" alt="selectable UI" width="200">

[示例](/zh/examples/plugins#annotation)

## 安装方式

该插件依赖 [g-plugin-dragndrop](/zh/plugins/dragndrop) 提供的拖拽能力，因此在使用时需要同时注册：

```js
import { Plugin as PluginDragndrop } from '@antv/g-plugin-dragndrop';
import { Plugin as PluginAnnotation } from '@antv/g-plugin-annotation';

renderer.registerPlugin(new PluginDragndrop());
renderer.registerPlugin(new PluginAnnotation());
```

## 使用方式

该插件提供两种模式，可以通过 [setDrawingMode](/zh/plugins/annotation#setdrawingmode) 进行切换：

-   绘制模式。该模式下可按预设步骤绘制图形。
-   编辑模式。该模式下选中 `selectable` 图形会出现对应的编辑组件，通过组件交互完成图形平移、resize 等编辑操作。

### 绘制模式

进入绘制模式后，使用 [setDrawer](/zh/plugins/annotation#setdrawer) 设置对应图形的绘制工具，即可开始绘制。例如我们想绘制折线：

```js
plugin.setDrawingMode(true);
plugin.setDrawer(DrawerTool.Polyline);
// or
plugin.setDrawer('polyline');
```

目前我们提供以下绘制工具：

```js
export enum DrawerTool {
  Circle = 'circle',
  Rect = 'rect',
  Polygon = 'polygon',
  Polyline = 'polyline',
}
```

在绘制过程中会触发一系列事件。在 Fabric.js 中需要先设置 Brush 笔刷，再进行绘制。使用该插件时，需要监听绘制完毕事件，使用事件对象中携带的绘制点数据创建基础图形并添加到画布中。

```js
annotationPlugin.addEventListener('draw:complete', ({ type, path }) => {
    // use any brush you preferred
    const brush = {
        stroke: 'black',
        strokeWidth: 10,
        selectable: true,
    };
});
```

#### 绘制关键点

按下鼠标确定点的位置，随后可以使用该位置绘制任意图形例如 [Circle](/zh/api/basic/circle)。

#### 绘制矩形

按下鼠标、拖拽再抬起即可完成绘制。

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*AdchSpfkON0AAAAAAAAAAAAAARQnAQ" alt="draw a rect" width="400" />

支持以下键盘快捷操作：

-   `esc` 取消绘制

#### 绘制折线

依次按下鼠标确定顶点，双击鼠标或者连续顶点距离很近即视为结束绘制，顶点间连线形成最终的折线。

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*cWBbT54Ym9cAAAAAAAAAAAAAARQnAQ" alt="draw a polyline" width="400" />

支持以下键盘快捷操作：

-   `esc` 取消绘制
-   `shift` + `Z` 撤销最新的一个线段
-   `space` 完成绘制

#### 绘制多边形

依次按下鼠标确定顶点，闭合形成多边形。

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*XO54RqJPp7AAAAAAAAAAAAAAARQnAQ" alt="draw a polygon" width="400" />

支持以下键盘快捷操作：

-   `esc` 取消绘制
-   `shift` + `Z` 撤销最新的一个线段
-   `space` 完成绘制

### 编辑模式

通过开启 `selectable` 可以让基础图形具备交互功能：

```js
circle.style.selectable = true;
```

目前我们支持以下**基础图形**：[Circle](/zh/api/basic/circle)、[Ellipse](/zh/api/basic/ellipse)、[Rect](/zh/api/basic/rect)、[Image](/zh/api/basic/image)、[Line](/zh/api/basic/line)、[Polyline](/zh/api/basic/polyline)

另外 `anchorsVisibility` 可以控制锚点可见性。`maskDraggable` 可以控制蒙层是否可拖拽。

#### 选中图形

我们支持通过交互或者 API 选中单个或者多个图形。

通过 API 方式选中图形，可以调用 [selectDisplayObject](/zh/plugins/annotation#selectdisplayobject) 方法。图形被选中后会在上面出现一个蒙层，蒙层中包含若干锚点。

点击图形即可完成单选，这也是最常见的方式。我们支持以下两种方式完成多选：

-   按住 `shift` 配合点击，在保留已选中图形的基础上追加选中
-   按住 `shift` 并拖拽出一个矩形完成区域刷选

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*kf-wR5_SY4YAAAAAAAAAAAAAARQnAQ" alt="multi-select" width="300">

#### 取消选中图形

和选中图形相对，取消选中也有两种方式：

-   点击画布空白区域或者另一个图形。
-   通过 API 方式取消选中图形，调用 [deselectDisplayObject](/zh/plugins/annotation#deselectdisplayobject) 方法。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gLusRqf4zmQAAAAAAAAAAAAAARQnAQ" alt="deselect target" width="200">

#### 移动图形

选中图形后，在蒙层上拖拽即可实现图形移动：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rC-ERaSSrmcAAAAAAAAAAAAAARQnAQ" alt="move target">

在移动过程中以及移动完毕后会触发相应 [事件]()。

另外也可以在选中图形后，使用键盘上下左右方向键移动图形，移动的步长可以通过 [arrowKeyStepLength](/zh/plugins/annotation#arrowkeysteplength) 配置。

#### 改变图形大小

拖拽锚点可以改变图形的大小。以下图为例，拖拽右下角的锚点时，实际上是先固定了左上角，再修改图片的宽高。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gmraRLDxW_kAAAAAAAAAAAAAARQnAQ" alt="resize target">

## 插件初始化配置

在创建插件时，可以传入一些初始化配置。

### isDrawingMode

是否为绘制模式，默认值为 `true`。

### enableAutoSwitchDrawingMode

在某些场景下自动切换，默认值为 `false`。

-   在绘制模式下点击可交互图形，将自动切换成编辑模式。
-   在编辑模式下点击空白区域，将自动切换成绘制模式。

### enableDeleteTargetWithShortcuts

支持使用键盘快捷键删除已选中的可交互图形，默认值为 `false`。

开启后，可使用 `Delete` / `Esc` / `Backspace` 按键删除已选中的可交互图形。

### enableContinuousBrush

是否支持连续按住 `shift` 进行框选，默认值为 `true`。

关闭后，每次框选都会清除上一次的结果，重新选择。

### arrowKeyStepLength

编辑模式下，使用键盘上下左右方向键移动图形的步长，默认值为 `4`。

### selectableStyle

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

除了在初始化插件时指定，后续也可以随时使用 [updateSelectableStyle](/zh/plugins/annotation#updateselectablestyle) 方法修改。

#### selectionFill

蒙层填充色，可以参考 [fill](/zh/api/basic/display-object#fill) 的取值，例如：

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionFill: 'rgba(0, 0, 0, 0.5)',
    },
});
```

#### selectionFillOpacity

蒙层填充色透明度，可以参考 [fillOpacity](/zh/api/basic/display-object#fillopacity) 的取值。

#### selectionStroke

蒙层描边颜色。可以参考 [stroke](/zh/api/basic/display-object#stroke) 的取值。

```js
const plugin = new PluginAnnotation({
    selectableStyle: {
        selectionStroke: 'rgba(0, 0, 0, 0.5)',
    },
});
```

#### selectionStrokeOpacity

蒙层描边透明度，可以参考 [strokeOpacity](/zh/api/basic/display-object#strokeopacity) 的取值。

#### selectionStrokeWidth

蒙层描边线宽。可以参考 [strokeWidth](/zh/api/basic/display-object#strokewidth) 的取值。

#### selectionLineDash

蒙层描边虚线。可以参考 [lineDash](/zh/api/basic/display-object#linedash) 的取值。

#### anchorFill

锚点填充色。

#### anchorFillOpacity

锚点填充色透明度。

#### anchorStroke

锚点描边色。

#### anchorStrokeOpacity

锚点描边色透明度。

#### anchorStrokeWidth

锚点描边线宽。

#### anchorSize

锚点尺寸。暂时我们仅支持圆形锚点，因此该属性等同于圆的半径。

### drawerStyle

辅助绘制组件样式。初始值通过构造函数 `drawStyle` 参数指定，后续可通过 [updateDrawerStyle](/zh/plugins/annotation#updatedrawerstyle) 更新。

例如我们想指定矩形绘制组件的描边颜色：

```js
const annotationPlugin = new AnnotationPlugin({
    drawerStyle: {
        rectStroke: 'red',
    },
});
```

#### rectFill

可参考 [fill](/zh/api/basic/display-object#fill)，默认值为 `'none'`。

#### rectFillOpacity

可参考 [fillOpacity](/zh/api/basic/display-object#fillopacity)，默认值为 `1`。

#### rectStroke

可参考 [stroke](/zh/api/basic/display-object#stroke)，默认值为 `'#FAAD14'`。

#### rectStrokeOpacity

可参考 [strokeOpacity](/zh/api/basic/display-object#strokeopacity)，默认值为 `1`。

#### rectStrokeWidth

可参考 [strokeWidth](/zh/api/basic/display-object#strokewidth)，默认值为 `2.5`。

#### rectLineDash

可参考 [lineDash](/zh/api/basic/display-object#linedash)，默认值为 `6`。

#### polylineVertexSize

折线已绘制顶点尺寸。暂时我们仅支持圆形顶点，因此该属性等同于圆的半径，默认值为 `6`。

以下图为例，空心圆为已绘制顶点，实线为已绘制线段；实心圆为正在绘制的顶点，虚线为正在绘制的线段。

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*RDKsRIgEAqIAAAAAAAAAAAAAARQnAQ" alt="draw polyline" width="300">

#### polylineVertexFill

可参考 [fill](/zh/api/basic/display-object#fill)，默认值为 `'#FFFFFF'`。

#### polylineVertexFillOpacity

可参考 [fillOpacity](/zh/api/basic/display-object#fillopacity)，默认值为 `1`。

#### polylineVertexStroke

可参考 [stroke](/zh/api/basic/display-object#stroke)，默认值为 `'#FAAD14'`。

#### polylineVertexStrokeOpacity

可参考 [strokeOpacity](/zh/api/basic/display-object#strokeopacity)，默认值为 `1`。

#### polylineVertexStrokeWidth

可参考 [strokeWidth](/zh/api/basic/display-object#strokewidth)，默认值为 `2`。

#### polylineSegmentStroke

折线已绘制线段颜色，可参考 [stroke](/zh/api/basic/display-object#stroke)，默认值为 `'#FAAD14'`。

#### polylineSegmentStrokeWidth

折线已绘制线段线宽，可参考 [strokeWidth](/zh/api/basic/display-object#strokewidth)，默认值为 `2`。

#### polylineActiveVertexSize

折线正在绘制顶点的尺寸。暂时我们仅支持圆形顶点，因此该属性等同于圆的半径，默认值为 `6`。

#### polylineActiveVertexFill

可参考 [fill](/zh/api/basic/display-object#fill)，默认值为 `'#FFFFFF'`。

#### polylineActiveVertexFillOpacity

可参考 [fillOpacity](/zh/api/basic/display-object#fillopacity)，默认值为 `1`。

#### polylineActiveVertexStroke

可参考 [stroke](/zh/api/basic/display-object#stroke)，默认值为 `'#FAAD14'`。

#### polylineActiveVertexStrokeOpacity

可参考 [strokeOpacity](/zh/api/basic/display-object#strokeopacity)，默认值为 `0.2`。

#### polylineActiveVertexStrokeWidth

可参考 [strokeWidth](/zh/api/basic/display-object#strokewidth)，默认值为 `2`。

#### polylineActiveSegmentStroke

折线正在绘制线段颜色，可参考 [stroke](/zh/api/basic/display-object#stroke)，默认值为 `'#FAAD14'`。

#### polylineActiveSegmentStrokeWidth

折线正在绘制线段线宽，可参考 [strokeWidth](/zh/api/basic/display-object#strokewidth)，默认值为 `2.5`。

## API

以下 API 可以通过插件实例调用，例如：

```js
const plugin = new PluginAnnotation();

circle.style.selectable = true;
plugin.selectDisplayObject(circle);
```

### setDrawingMode

设置是否开启绘制模式。

```js
// 进入绘制模式
plugin.setDrawingMode(true);

// 进入编辑模式
plugin.setDrawingMode(false);
```

### setDrawer

在绘制模式下，我们提供以下图形的绘制能力：

-   `circle`
-   `rect`
-   `polyline`
-   `polygon`

例如绘制矩形：

```js
plugin.setDrawingMode(true);
plugin.setDrawer('rect');
```

### selectDisplayObject

选中一个图形。并不会对其他已选择的图形应用取消操作。

```js
plugin.selectedDisplayObject(circle);
```

### deselectDisplayObject

取消选中一个图形。

```js
plugin.deselectedDisplayObject(circle);
```

### getSelectedDisplayObjects

获取当前选中的图形列表。

```js
plugin.getSelectedDisplayObjects(); // [circle, path]
```

### updateSelectableStyle

实时更新交互组件的[样式](/zh/plugins/annotation#辅助操作组件样式)，例如在 [示例](/zh/examples/plugins#annotation) 中修改蒙层填充色：

```js
plugin.updateSelectableStyle({
    selectionFill: 'red',
});
```

### updateDrawerStyle

更新辅助绘制组件的样式，例如：

```js
plugin.updateDrawerStyle({
    rectStroke: 'red',
});
```

### markSelectableUIAsDirty

有时目标图形的定义发生了修改，需要让辅助操作组件感知并重新生成，此时可以手动调用该方法：

```js
circle.style.cx = 100;
circle.style.cy = 100;

plugin.markSelectableUIAsDirty(circle);
```

## 事件

在不同模式下会触发不同事件，例如绘制模式下会在插件上触发，而编辑模式下会在图形上触发。

### 绘制模式

不同于 Fabric.js 的“自由绘制”模式，在插件上监听不同绘制阶段触发的事件，获取事件对象中包含的几何信息，自行创建对应图形并应用自定义样式完成绘制。

支持以下事件：

```js
export enum DrawerEvent {
  START = 'draw:start',
  MOVE = 'draw:move',
  MODIFIED = 'draw:modify',
  COMPLETE = 'draw:complete',
  CANCEL = 'draw:cancel',
}
```

事件对象包含如下数据，其中关键属性为：

-   `type` 绘制图形类型。目前支持 `rect` `polyline` `polygon`
-   `path` 绘制图形顶点列表，形如：`[{ x: 0, y: 0 }, { x: 100, y: 100 }...]`

```js
plugin.addEventListener(DrawerEvent.COMPLETE, ({ type, path }) => {});
```

#### 开始绘制

#### 绘制中

#### 取消绘制

#### 结束绘制

在结束绘制后，辅助绘制 UI 会自动隐藏，此时我们可以使用顶点数据绘制最终图形。

```js
plugin.addEventListener(DrawerEvent.COMPLETE, ({ type, path }) => {
    // use any brush you preferred
    const brush = {
        stroke: 'black',
        strokeWidth: 10,
        selectable: true,
    };

    if (type === 'polyline') {
        const polyline = new Polyline({
            style: {
                ...brush,
                points: path.map(({ x, y }) => [x, y]),
            },
        });
        canvas.appendChild(polyline);
    }
});
```

### 编辑模式

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

#### 选中事件

当目标图形被选中时触发。在 [示例](/zh/examples/plugins#annotation) 中，我们监听了图片的选中事件：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('selected', () => {});
// or
image.addEventListener(SelectableEvent.SELECTED, () => {});
```

#### 取消选中事件

当目标图形被取消选中时触发。在 [示例](/zh/examples/plugins#annotation) 中，我们监听了图片的取消选中事件：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('deselected', () => {});
// or
image.addEventListener(SelectableEvent.DESELECTED, () => {});
```

#### 移动中事件

拖拽蒙层时目标图形会跟着移动，此过程会持续触发移动中事件，类似 [g-plugin-dragndrop](/zh/plugins/dragndrop) 中的 `dragging`：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('moving', () => {});
// or
image.addEventListener(SelectableEvent.MOVING, () => {});
```

该事件对象上携带以下信息：

```js
image.addEventListener('moving', (e) => {
    const { movingX, movingY } = e.detail;
});
```

#### 移动完毕事件

当拖拽结束后，会触发该事件，类似 [g-plugin-dragndrop](/zh/plugins/dragndrop) 中的 `dragend`：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('moved', () => {});
// or
image.addEventListener(SelectableEvent.MOVED, () => {});
```

#### 修改事件

在锚点上拖拽可以对图形进行缩放，此过程也会持续触发修改事件：

```js
import { SelectableEvent } from '@antv/g-plugin-annotation';

image.addEventListener('modified', () => {});
// or
image.addEventListener(SelectableEvent.MODIFED, () => {});
```
