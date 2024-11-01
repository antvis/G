---
title: Image
order: 5
---

You can refer to the [\<image\>](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/image) element of SVG.

The following [example](/en/examples/shape/image/#image) defines an image with a top-left vertex position of `(200, 100)`.

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

Usually we are used to centering on the image, which can be modified by the anchor [anchor](/en/api/display-object#anchor).

```javascript
const image = new Image({
    style: {
        //...
        anchor: [0.5, 0.5],
    },
});
```

:::warning{title=Large-size-image}

If you encounter performance issues with large images, try turning on the [`enableLargeImageOptimization`](../canvas/options.en.md#enablelargeimageoptimization) configuration.

:::

## Inherited from

Inherits [style property](/en/api/basic/display-object#drawing-properties) from [DisplayObject](/en/api/basic/display-object).

### anchor

The default value is `[0, 0]`. For details, see [DisplayObject's anchor](/en/api/basic/display-object#anchor).

### transformOrigin

The default value is `left top`. For details, see [DisplayObject's transformOrigin](/en/api/basic/display-object#transformOrigin).

## Additional Properties

### x

The x-axis coordinates of the top-left vertex of the image in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/x>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### y

The y-axis coordinates of the top-left vertex of the image in the local coordinate system.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/y>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### src

Image sources, supports the following types:

-   `string` Image address string, displayed after successful loading
-   `HTMLImageElement` Create your own [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) object to create a G Image in the `onload` callback, as shown in the following example.

<br />

```js
import { Image as GImage, Canvas } from '@antv/g';

let image;
const img = new Image();

img.src =
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ';
img.crossOrigin = 'Anonymous';
img.onload = () => {
    image = new GImage({
        style: {
            x: 200,
            y: 100,
            width: 200,
            height: 200,
            src: img,
        },
    });
    canvas.appendChild(image);
};
```

### width

Image width.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/width>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### height

Image height.

<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/height>

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | - | no | yes | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### keepAspectRatio

Whether to keep aspect ratio, when enabled we can only provide height or width, the missing item will be calculated according to raw ratio. [Example](/en/examples/shape/image#image-keep-aspect-ratio)

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

Whether or not to always face the camera in 3D scenes, defaults to `false`, also known as the "billboard effect".

In [example](/en/examples/3d/3d-basic#billboard), the image is rendered compressed when the camera is rotated without being turned on:

![disable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*DptES7Mly00AAAAAAAAAAAAADmJ7AQ/original)

Turning it on doesn't change the position of the image, but it will always face the camera. This is in line with what is usually required for 2D graphics like text in 3D scenes:

![enable billboard effect](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*A28RS4TxIZYAAAAAAAAAAAAADmJ7AQ/original)

### billboardRotation

Rotation angle in billboard mode, clockwise in radians.

In [example](/zh/examples/3d/3d-basic#billboard), we add a rotation angle to the image:

```js
image.style.isBillboard = true;
image.style.billboardRotation = Math.PI / 8;
```

![billboard rotation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*v8ngTbgkP-MAAAAAAAAAAAAADmJ7AQ/original)

## isSizeAttenuation

Whether or not to apply size attenuation in perspective projection. This option can be turned on if you want to keep the size consistent regardless of depth, following the "near big, far small" visual effect in perspective projection.

In [example](/en/examples/3d/3d-basic#size-attenuation), we enable size attenuation for image:

```js
image.style.isSizeAttenuation = true;
```

![enable size attenuation](https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*uLDORaJ-snoAAAAAAAAAAAAADmJ7AQ/original)
