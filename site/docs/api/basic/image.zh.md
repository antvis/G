---
title: Image 图片
order: 5
---

可以参考 SVG 的 [\<image\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/image) 元素。

如下 [示例](/zh/examples/shape/image/#image) 定义了一个图片，左上角顶点位置为 `(200, 100)`：

```javascript
const image = new Image({
    style: {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
        src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});
```

通常我们习惯以图片中心，此时可以通过锚点 [anchor](/zh/api/display-object#anchor) 进行修改：

```javascript
const image = new Image({
    style: {
        // 省略其他属性
        anchor: [0.5, 0.5],
    },
});
```

:::warning{title=大尺寸图片}

对于大尺寸图片，如果遇到性能问题，可以尝试打开 [`enableLargeImageOptimization`](../canvas/options.zh.md#enablelargeimageoptimization) 配置。

:::

## 继承自

继承了 [DisplayObject](/zh/api/basic/display-object) 的 [样式属性](/zh/api/basic/display-object#绘图属性)。

### anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/api/basic/display-object#anchor)

### transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/api/basic/display-object#transformOrigin)

## 额外属性

### x

局部坐标系下，图片左上角顶点的 x 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### y

局部坐标系下，图片左上角顶点的 y 轴坐标。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### src

图片来源，支持以下类型：

-   `string` 图片链接地址
-   `HTMLImageElement` 创建 [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) 对象实例，在 `onload` 回调中创建 G Image 对象，示例如下：

<br />

```js
import { Image as GImage, Canvas } from '@antv/g';

let image;
const img = new Image();

img.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ';
img.crossOrigin = 'Anonymous';
img.onload = () => {
    // 图片加载成功后创建
    image = new GImage({
        style: {
            x: 200,
            y: 100,
            width: 200,
            height: 200,
            src: img, // 传入 Image 对象
        },
    });
    canvas.appendChild(image);
};
```

### width

图片宽度。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### height

图片高度。

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height>

| [初始值](/zh/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/api/css/inheritance) | 是否支持动画 | [计算值](/zh/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | 否 | 是 | [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) [\<length\>](/zh/api/css/css-properties-values-api#length) |

### keepAspectRatio

保持宽高比。开启后，只需要传入宽高任意一项，加载完成后根据原始图片的宽高比计算缺失项。[示例](/zh/examples/shape/image#image-keep-aspect-ratio)

```ts
const image = new Image({
    style: {
        width: 200,
        keepAspectRatio: true,
        src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});
```

### isBillboard

在 3D 场景下是否永远面朝相机，默认为 `false`，也称作“公告牌效果”。

在[示例](/zh/examples/3d/3d-basic#billboard)中，未开启情况下在相机发生旋转时，图片会呈现被压缩的效果：

![disable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*DptES7Mly00AAAAAAAAAAAAADmJ7AQ/original)

开启后并不会改变图片的位置，但它会始终面朝相机。这也符合通常 3D 场景下对于图片这类 2D 图形的需求：

![enable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*A28RS4TxIZYAAAAAAAAAAAAADmJ7AQ/original)

### billboardRotation

公告牌模式下的旋转角度，顺时针方向以 radians 为单位。

在[示例](/zh/examples/3d/3d-basic#billboard)中，我们为图片增加一个旋转角度：

```js
image.style.isBillboard = true;
image.style.billboardRotation = Math.PI / 8;
```

![billboard rotation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*v8ngTbgkP-MAAAAAAAAAAAAADmJ7AQ/original)

## isSizeAttenuation

在透视投影下，是否进行尺寸衰减。在透视投影中遵循“近大远小”的视觉效果，如果希望保持大小始终一致不受深度影响，可以开启该选项。

在[示例](/zh/examples/3d/3d-basic#size-attenuation)中，我们为图片开启了尺寸衰减：

```js
image.style.isSizeAttenuation = true;
```

![enable size attenuation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*uLDORaJ-snoAAAAAAAAAAAAADmJ7AQ/original)
