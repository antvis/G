---
title: Image 图片
order: 5
---

可以参考 SVG 的 [\<image\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/image) 元素。

如下 [示例](/zh/examples/shape#image) 定义了一个图片，左上角顶点位置为 `(200, 100)`：

```javascript
const image = new Image({
    style: {
        x: 200,
        y: 100,
        width: 200,
        height: 200,
        img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});
```

通常我们习惯以图片中心，此时可以通过锚点 [anchor](/zh/docs/api/display-object#anchor) 进行修改：

```javascript
const image = new Image({
    style: {
        // 省略其他属性
        anchor: [0.5, 0.5],
    },
});
```

## 继承自

继承了 [DisplayObject](/zh/docs/api/basic/display-object) 的 [样式属性](/zh/docs/api/basic/display-object#绘图属性)。

### anchor

默认值为 `[0, 0]`。详见 [DisplayObject anchor](/zh/docs/api/basic/display-object#anchor)

### transformOrigin

默认值为 `left top`。详见 [DisplayObject transformOrigin](/zh/docs/api/basic/display-object#transformOrigin)

## 额外属性

### x

局部坐标系下，图片左上角顶点的 x 轴坐标。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value)                                                                     |
| ------------------------------------------------------------------ | -------- | ------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                | -        | 否                                         | 是           | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

### y

局部坐标系下，图片左上角顶点的 y 轴坐标。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value)                                                                     |
| ------------------------------------------------------------------ | -------- | ------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                | -        | 否                                         | 是           | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

### img

图片来源，支持以下两种：

-   图片地址字符串，加载成功后展示
-   自行创建 [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) 对象，在 `onload` 回调中创建 G Image，示例如下：

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
            img, // 传入 Image 对象
        },
    });
    canvas.appendChild(image);
};
```

### src

该属性为 [img](/zh/docs/api/basic/image) 的别名。

### width

图片宽度。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value)                                                                     |
| ------------------------------------------------------------------ | -------- | ------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                | -        | 否                                         | 是           | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |

### height

图片高度。

https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height

| [初始值](/zh/docs/api/css/css-properties-values-api#initial-value) | 适用元素 | [是否可继承](/zh/docs/api/css/inheritance) | 是否支持动画 | [计算值](/zh/docs/api/css/css-properties-values-api#computed-value)                                                                     |
| ------------------------------------------------------------------ | -------- | ------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                | -        | 否                                         | 是           | [\<percentage\>](/zh/docs/api/css/css-properties-values-api#percentage) [\<length\>](/zh/docs/api/css/css-properties-values-api#length) |
