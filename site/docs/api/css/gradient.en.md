---
title: Gradient
order: 11
---

In CSS, gradients are created by functions such as [linear-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient).

```css
background: linear-gradient(#e66465, #9198e5);
```

We have followed that syntax so that it can be used in properties that support gradients.

```js
rect.style.fill = 'linear-gradient(#e66465, #9198e5)';
```

In this [example](/en/examples/style/gradient/#gradient) we show the currently supported gradient effects, including linear and radial gradients, multiple gradients overlaid, etc.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*sXoJTKPWg70AAAAAAAAAAAAAARQnAQ" width="400" alt="gradient">

## linear-gradient

Linear gradients are used to create an image that represents a linear gradient of two or more colors. [This tutorial](https://observablehq.com/@danburzo/css-gradient-line) can help you understand the meaning and calculation logic of the linear gradient direction.

The usage is exactly like CSS [linear-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient), but with the following differences.

-   The gradient direction defaults to bottom-to-top in CSS, while we use left-to-right to be consistent with Canvas / SVG.

So a linear gradient with a left-to-right orientation and a rotation angle of 0 would look like this, [example](/en/examples/style/gradient/#gradient).

```js
rect.style.fill = 'linear-gradient(0deg, blue, green 40%, red)';
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aU84RIJaH6AAAAAAAAAAAAAAARQnAQ" width="300" alt="linear gradient">

Finally, consistent with CSS, multiple gradients can be stacked.

```js
rect.style.fill = `linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
            linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
            linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`;
```

## radial-gradient

A radial gradient consists of a gradual transition between two or more colors emanating from the origin.

The usage is exactly like CSS [radial-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient).

So a gradient centered at the center of the shape, with a radial gradient transitioning from red to blue to green as follows, [example](/en/examples/style/gradient/#gradient).

```js
rect.style.fill = 'radial-gradient(circle at center, red, blue, green 100%)';
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z4QLTr3lC80AAAAAAAAAAAAAARQnAQ" width="300" alt="radial gradient">

Caution.

-   Shapes are only supported for `circle` but not for `ellipse`
-   Support for specifying `circle` radius

    -   `'closest-side'` The gradient's ending shape meets the side of the box closest to its center.
    -   `'farthest-corner'` The default value, the gradient's ending shape is sized so that it exactly meets the farthest corner of the box from its center.
    -   `'closest-corner'` The gradient's ending shape is sized so that it exactly meets the closest corner of the box from its center.
    -   `'farthest-side'` Similar to closest-side, except the ending shape is sized to meet the side of the box farthest from its center (or vertical and horizontal sides).
    -   `<length>` e.g. `'radial-gradient(circle 80px at center, red 100%, blue 100%)'`

The following figures show the effect of `'closest-side'`, `'farthest-side'` and `80px` respectively.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*eXrBQYlLENwAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-closest-side" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*C__VRJ24rVcAAAAAAAAAAAAAARQnAQ" 
alt="radial-gradient-farthest-side" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*3U91RYB3DukAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-size-80" width="200">

-   Support specifying the position of the center of the circle and positioning it relative to the upper left corner of the enclosing box, e.g. `radial-gradient(circle at 50px 50px, red, blue, green 100%)`.
    -   `'top'` Top edge midpoint
    -   `'left'` Left edge midpoint
    -   `'bottom'` Bottom edge midpoint
    -   `'right'` Right edge midpoint
    -   `'center'` Horizontal and vertical centering
    -   `'top left'` Left-top corner
    -   `'left top'` Same as `'top left'`
    -   `'top right'` Right-top corner
    -   `'bottom left'` Left-bottom corner
    -   `'bottom right'` Right-bottom corner
    -   `<length> <length>` e.g. `'25% 25%'` and `'50px 50px'`

The following figures show the effect of `'50px 50px'`, `'top right'` and `'left'` respectively.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*UrmySIhRKdgAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-50-50" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*ekj4TZv0Yf4AAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-top-right" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*bXIjTaTpC2QAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-left" width="200">

-   Like linear gradients, it also supports multiple overlays.
