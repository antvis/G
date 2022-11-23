---
title: Gradient
order: 11
---

在 CSS 中，渐变是通过函数创建的，例如线性渐变 [linear-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient)：

```css
background: linear-gradient(#e66465, #9198e5);
```

我们沿用了该语法，因此可以在支持渐变的属性中使用：

```js
rect.style.fill = 'linear-gradient(#e66465, #9198e5)';
```

其中渐变色列表 `<color-stop-list>` 形如：`radial-gradient(cyan 0%, transparent 20%, salmon 40%)`，使用 [\<color\>](/zh/api/css/css-properties-values-api#color) 和 [\<percentage\>](/zh/api/css/css-properties-values-api#percentage) 的组合。

在该[示例](/zh/examples/style/gradient/#gradient)中我们展示了目前支持的渐变效果，包括线性和径向渐变、多个渐变叠加等：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*sXoJTKPWg70AAAAAAAAAAAAAARQnAQ" width="400" alt="gradient">

## linear-gradient

线性渐变用于创建一个表示两种或多种颜色线性渐变的图片。[这个教程](https://observablehq.com/@danburzo/css-gradient-line)可以帮助你理解线性渐变方向的含义和计算逻辑。

用法完全可以参考 CSS [linear-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient)，但有以下区别：

-   渐变方向在 CSS 中默认为从下到上，而我们为了和 Canvas / SVG 保持一致，使用从左到右。

因此一个从左到右方向，旋转角度为 0 的线性渐变如下，[示例](/zh/examples/style/gradient/#gradient)：

```js
rect.style.fill = 'linear-gradient(0deg, blue, green 40%, red)';
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*aU84RIJaH6AAAAAAAAAAAAAAARQnAQ" width="300" alt="linear gradient">

最后和 CSS 一致，多组渐变可以叠加：

```js
rect.style.fill = `linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
            linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
            linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`;
```

## radial-gradient

径向渐变由从原点发出的两种或者多种颜色之间的逐步过渡组成。

用法完全可以参考 CSS [radial-gradient](https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient)。

因此一个渐变中心位于图形中心，从红过渡到蓝再到绿的径向渐变如下，[示例](/zh/examples/style/gradient/#gradient)：

```js
rect.style.fill = 'radial-gradient(circle at center, red, blue, green 100%)';
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z4QLTr3lC80AAAAAAAAAAAAAARQnAQ" width="300" alt="radial gradient">

注意事项：

-   形状仅支持 `circle` 不支持 `ellipse`
-   支持指定 `circle` 半径：

    -   `'closest-side'` 圆心到包围盒最近边的距离
    -   `'farthest-corner'` **默认值**。圆心到包围盒最远角的距离
    -   `'closest-corner'` 圆心到包围盒最近角的距离
    -   `'farthest-side'` 圆心到包围盒最远边的距离
    -   `<length>` 指定长度，例如 `'radial-gradient(circle 80px at center, red 100%, blue 100%)'`

下图分别展示了 `'closest-side'` `'farthest-side'` 和 `80px` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*eXrBQYlLENwAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-closest-side" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*C__VRJ24rVcAAAAAAAAAAAAAARQnAQ" 
alt="radial-gradient-farthest-side" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*3U91RYB3DukAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-size-80" width="200">

-   支持指定圆心位置，相对包围盒左上角定位，例如 `radial-gradient(circle at 50px 50px, red, blue, green 100%)`：
    -   `'top'` 上方边缘中点
    -   `'left'` 左侧边缘中点
    -   `'bottom'` 下方边缘中点
    -   `'right'` 右侧边缘中点
    -   `'center'` 水平垂直居中
    -   `'top left'` 左上角
    -   `'left top'` 同 `'top left'`
    -   `'top right'` 右上角
    -   `'bottom left'` 左下角
    -   `'bottom right'` 右下角
    -   `<length> <length>` 指定长度，例如 `'25% 25%'` 或者 `'50px 50px'`

下图分别展示了 `'50px 50px'`，`'top right'` 和 `'left'` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*UrmySIhRKdgAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-50-50" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*ekj4TZv0Yf4AAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-top-right" width="200">
<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*bXIjTaTpC2QAAAAAAAAAAAAAARQnAQ" alt="radial-gradient-center-left" width="200">

-   和线性渐变一样，也支持多组叠加

## 常见问题

### 历史用法

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5gpQL9ia9kAAAAAAAAAAABkARQnAQ)

-   `l` 表示使用线性渐变，绿色的字体为可变量，由用户自己填写。

```js
// example
// 使用渐变色描边，渐变角度为 0，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9sc1SY2d_0AAAAAAAAAAAABkARQnAQ)

-   `r` 表示使用放射状渐变，绿色的字体为可变量，由用户自己填写，开始圆的 `x`、`y`、`r` 值均为相对值(0 至 1 范围)。

```js
// example
// 使用渐变色填充，渐变起始圆的圆心坐标为被填充物体的包围盒中心点，半径为(包围盒对角线长度 / 2) 的 0.1 倍，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```
