---
title: 自定义图形
order: 3
---

我们提供了一些[基础图形](/zh/api/basic/display-object)，例如 [Circle](/zh/api/basic/circle)、[Path](/zh/api/basic/path) 等等。通过[场景图](/zh/guide/diving-deeper/scenegraph)能力也能构建它们之间的层次关系。但当场景层次嵌套较深又需要复用时，我们便需要一种自定义组件机制，能把这些基础图形封装成高级图形。

类似的问题在 Web Components 中是通过 [Custom Element](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements) 实现的。在[官方示例](https://github.com/mdn/web-components-examples/blob/main/life-cycle-callbacks/main.js)中我们能看到一个自定义图形的注册过程按照如下步骤进行：

-   在构造函数中创建内部 DOM 结构
-   在 [connectedCallback()](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements#%E4%BD%BF%E7%94%A8%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0) 即元素首次插入文档后，设置样式
-   在 [attributeChangedCallback()](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements#%E4%BD%BF%E7%94%A8%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0) 中处理属性更新，重新设置样式
-   使用 [customElements.define()](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomElementRegistry/define) 完成自定义图形的注册

我们沿用了这样的设计。

在本文中我们将介绍自定义图形的用法，实现一个简单的箭头，其中包含以下步骤：

-   设计自定义属性
-   定义场景图
-   使用自定义图形
-   处理属性更新

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9Xs4SKUOAxwAAAAAAAAAAAAAARQnAQ)

过程中会涉及[场景图](/zh/guide/diving-deeper/scenegraph)、[动画系统](/zh/api/animation/waapi)、[事件系统](/zh/api/event)等。在开始前我们推荐先阅读以上各个系统的文档。

-   [完整 DEMO](/zh/examples/shape#arrow)
-   [源码](https://github.com/antvis/g/blob/next/packages/g-components/src/Arrow.ts)

## 问题背景

一个箭头由躯干部分 + 一或两个端点组成。如下图所示，躯干部分可以是 Line / Polyline / Path，而端点可以是任意基础/高级图形，我们提供的默认端点是 Path。可见箭头就是一个由若干基础图形组合而成的“高级图形”。

## 继承 CustomElement

首先所有自定义图形都需要继承 CustomElement 基类：

```js
import { CustomElement } from '@antv/g';

export class Arrow extends CustomElement<ArrowStyleProps> {}
```

然后可以定义自定义图形的属性，这里我们给箭头提供了以下自定义属性：

-   body 躯干部分只能接受 [Line](/zh/api/basic/line) [Path](/zh/api/basic/path) [Polyline](/zh/api/basic/polyline)
-   start/endHead 端点部分可以是任何基础图形，传入布尔值时开启/关闭默认内置端点
-   stroke/lineWidth/opacity 等常规绘图属性

```js
type ArrowHead = boolean | DisplayObject;
type ArrowBody = Line | Path | Polyline;

export interface ArrowStyleProps extends BaseStyleProps {
    body?: ArrowBody; // 躯干
    startHead?: ArrowHead; // 起始端点
    endHead?: ArrowHead; // 结束端点
    stroke?: string; // 颜色
    lineWidth?: number; // 线宽
    opacity?: number; // 透明度
    strokeOpacity?: number;
}
```

有了自定义属性，下一步需要通过场景图组合基础图形。

## 定义场景图

我们需要在构造函数中完成场景图的定义。这里会使用到基础图形的节点操作能力，例如使用 [appendChild](/zh/api/basic/display-object#添加删除节点) 添加箭头的躯干和端点部分。

```js
static tag = 'arrow';

constructor(config: DisplayObjectConfig<ArrowStyleProps>) {
  // 调用基类构造函数
  super({
    ...config,
    type: Arrow.tag, // 定义自定义图形类型
  });

  // 获取用户传入的自定义属性
  // @see /zh/api/builtin-objects/element#attributes
  const { body, startHead, endHead, ...rest } = this.attributes;

  // 躯干部分必须指定
  if (!body) {
    throw new Error("Arrow's body is required");
  }

  // 添加躯干
  this.body = body;
  this.appendChild(this.body);

  // 添加起始/结束端点
  if (startHead) {
    this.appendArrowHead(this.getArrowHeadType(startHead), true);
  }
  if (endHead) {
    this.appendArrowHead(this.getArrowHeadType(endHead), false);
  }

  // 给躯干、端点应用样式
  this.applyArrowStyle(rest, [this.body, this.startHead, this.endHead]);
}
```

### 添加端点

我们支持内置端点和用户传入的端点，即使是由用户传入，它也只用于描述端点的形状，为了确保箭头和躯干部分朝向一致，我们还需要对端点进行变换。另外，我们使用了 [zIndex](/zh/api/basic/display-object#zindex)，由于默认 zIndex 为 0，因此设置成 1 就可以保证端点的展示次序在躯干部分之上。

```js
private appendArrowHead(type: ArrowHeadType, isStart: boolean) {
  let head: DisplayObject;
  if (type === 'default') {
    // 创建一个默认端点
    head = this.createDefaultArrowHead();
  } else {
    // 使用用户传入的端点
    head = isStart ? this.attributes.startHead : this.attributes.endHead;
  }

  // 对端点进行变换
  this.transformArrowHead(head, isStart);

  // 让端点展示在躯干上
  head.setAttribute('zIndex', 1);
  // 或者 head.style.zIndex = 1;

  if (isStart) {
    this.startHead = head;
  } else {
    this.endHead = head;
  }

  // 场景图中添加端点
  this.appendChild(head);
}
```

对于内置默认端点，我们使用一个形如 `<` 的 [Path](/zh/api/basic/path)，这里将 anchor 设置为 `[0.5, 0.5]` 即 Path 的中心点，便于后续对端点进行变换：

```js
private createDefaultArrowHead() {
  // 沿用箭头的自定义属性
  const { stroke, lineWidth } = this.attributes;
  const { sin, cos, PI } = Math;
  return new Path({
    style: {
      path: `M${10 * cos(PI / 6)},${10 * sin(PI / 6)} L0,0 L${10 * cos(PI / 6)},-${10 * sin(PI / 6)
        }`,
      stroke,
      lineWidth,
      anchor: [0.5, 0.5], // 锚点默认为 [0, 0]
    },
  });
}
```

下一步需要对端点进行变换，确保它出现在正确的位置（躯干的两端）以及拥有正确的朝向。

### 变换端点

对于端点的变换可以分成两步，设置位置（躯干的起始还是结束）以及朝向。

根据不同的躯干图形，可以通过不同的方法得到两个端点坐标。需要注意的是，设置端点位置时，一定要使用[局部坐标系下的操作方法]()，即 setLocalPosition 或者 translateLocal，原因是我们希望端点在整个箭头而非世界坐标系下定位，这样当整个箭头移动时，其内部的各个组成部分（躯干、端点）会跟着移动，但彼此的相对位置不会改变。

同样的，在设置端点随躯干的旋转角度时，也需要在端点本身的旋转角度基础上，增加躯干切线的角度，因此需要使用 get/setLocalEulerAngles。

```js
private transformArrowHead(head: DisplayObject, isStart: boolean) {
  let rad = 0;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;

  // 躯干类型
  const bodyType = this.body && this.body.nodeName;
  if (bodyType === Shape.LINE) {
    // 省略计算切线
  } else if (bodyType === Shape.POLYLINE) {
    // 省略计算切线
  } else if (bodyType === Shape.PATH) {
    // 省略计算切线
  }

  // 计算弧度
  const x = x1 - x2;
  const y = y1 - y2;
  rad = Math.atan2(y, x);

  // 设置局部坐标系下的位置
  head.setLocalPosition(x2, y2);
  // 设置局部坐标系下的旋转角度，弧度转换成角度
  head.setLocalEulerAngles((rad * 180) / Math.PI + head.getLocalEulerAngles());
}
```

下面我们来看不同类型的躯干如何计算切线，这部分纯粹是简单的数学运算，和本文的主题关系不大。

### 计算切线

对于 Line 和 Polyline 只需要找到两个端点坐标相减即可，对于 Path 我们提供了[计算切线的 API](/zh/api/basic/path#getstarttangent-number)：

```js
private getTangent(path: Path, isStart: boolean): number[][] {
  return isStart ? path.getStartTangent() : path.getEndTangent();
}
```

至此一个简单的箭头就组装完成了。

## 使用自定义图形

自定义图形可以使用大部分基础图形的能力，例如节点操作、变换、动画、响应事件等。

### 节点操作

使用箭头这样的高级图形和其他基础图形一样，例如我们可以创建一个躯干为 Line 的箭头。随后对它使用变换方法，例如平移。同样也可以使用场景图的节点查询能力，例如 getElementById：

```js
const lineArrow = new Arrow({
    id: 'lineArrow',
    style: {
        body: new Line({
            style: {
                x1: 200,
                y1: 100,
                x2: 0,
                y2: 0,
            },
        }),
        startHead: true,
        stroke: '#1890FF',
        lineWidth: 10,
        cursor: 'pointer',
    },
});

// 平移
lineArrow.translate(200, 100);

// 按 id 查询
canvas.document.getElementById('lineArrow'); // Arrow lineArrow
```

### 应用动画

同样也可以对它[应用动画](/zh/api/animation/waapi)，例如对 transform stroke 和 opacity 这三个属性：

```js
lineArrow.animate(
    [
        { transform: 'scale(1)', stroke: '#F04864', opacity: 1 },
        { transform: 'scale(2)', stroke: '#1890FF', opacity: 0.8 },
    ],
    {
        duration: 1500,
        iterations: Infinity,
        easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    },
);
```

[完整 DEMO](/zh/examples/shape#arrow)

### 响应事件

自定义图形也可以[响应事件](/zh/api/event)，例如当鼠标移入移出时更改颜色：

```js
lineArrow.addEventListener('mouseenter', () => {
    lineArrow.style.stroke = '#2FC25B';
});
lineArrow.addEventListener('mouseleave', () => {
    lineArrow.style.stroke = '#1890FF';
});
```

## 处理属性更新

自定义属性有可能发生更新，例如在创建后改变箭头端点的样式，因此需要监听属性值的变化。参考 Web Components 标准，我们提供了以下生命周期方法供子类实现，这里我们着重关注 attributeChangedCallback。

```js
export interface CustomElement<CustomElementStyleProps> {
  /**
   * 加入画布时触发
   */
  connectedCallback?(): void;

  /**
   * 从画布移除时触发
   */
  disconnectedCallback?(): void;

  /**
   * 属性发生修改时触发
   */
  attributeChangedCallback?<Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    newValue: CustomElementStyleProps[Key],
  ): void;
}
```

在我们的 [DEMO](/zh/examples/shape#arrow) 中，可以随时切换端点和躯干图形。例如切换起始端点为一个图片：

```js
const image = new Image({
    style: {
        width: 50,
        height: 50,
        anchor: [0.5, 0.5],
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});
image.rotateLocal(90);
// 修改起始端点
lineArrow.style.startHead = image;
```

此时我们可以监听 startHead 属性的更新，当该属性发生修改时，首先需要移除已存在的起始端点，然后再重新添加：

```js
attributeChangedCallback<Key extends keyof ArrowStyleProps>(
  name: Key,
  oldValue: ArrowStyleProps[Key],
  newValue: ArrowStyleProps[Key],
) {
  if (name === 'startHead' || name === 'endHead') {
    const isStart = name === 'startHead';
    // 移除已有的端点
    this.destroyArrowHead(isStart);

    if (newValue) {
      const { body, startHead, endHead, ...rest } = this.attributes;
      // 重新添加端点
      this.appendArrowHead(this.getArrowHeadType(newValue), isStart);
      this.applyArrowStyle(rest, [isStart ? this.startHead : this.endHead]);
    }
  }
}
```

其中移除端点使用到了 removeChild，这同样是场景图提供的节点操作方法：

```js
private destroyArrowHead(isStart: boolean) {
  if (isStart && this.startHead) {
    this.removeChild(this.startHead);
    this.startHead = undefined;
  }
  if (!isStart && this.endHead) {
    this.removeChild(this.endHead);
    this.endHead = undefined;
  }
}
```

## 注意事项

一旦挂载到画布后，自定义组件就视作一个整体，内部的图形不能再通过场景图查询能力（例如 getElementById）获得。因此可以暴露方法给使用者，例如获取箭头的躯干、端点部分。

```js
getBody() {
  return this.body;
}

getStartHead() {
  return this.startHead;
}

getEndHead() {
  return this.endHead;
}
```
