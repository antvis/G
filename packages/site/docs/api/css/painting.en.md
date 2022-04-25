---
title: <paint>
order: 2
---

参考 SVG 中的 [\<paint\>](https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint)，它是以下类型的并集：

```js
<paint> = none | <color> | <gradient> | <pattern>
```

[示例](/zh/examples/style#paint)。

目前使用的属性有：

- [fill]() 填充色
- [stroke]() 描边色

# none

不使用任何颜色，并不等于 [\<color\>](/zh/docs/api/css/color) 的 [transparent](/zh/docs/api/css/color#transparent) 关键词。以 `fill` 属性为例，两者从视觉效果上看相同，但设置为 `'transparent'` 依然可以被拾取到，设置成 `'none'` 则不会。

例如当图形在初始化未设置 `fill` 属性时，等同于创建后手动修改为 `none`：

```js
const circle = new Circle({
  r: 150,
});

circle.style.fill = 'none';
```

# \<color\>

见 [\<color\>](/zh/docs/api/css/color)

# \<gradient\>

## 线性渐变

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5gpQL9ia9kAAAAAAAAAAABkARQnAQ)

- `l` 表示使用线性渐变，绿色的字体为可变量，由用户自己填写。

```js
// example
// 使用渐变色描边，渐变角度为 0，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

## 放射状/环形渐变

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9sc1SY2d_0AAAAAAAAAAAABkARQnAQ)

- `r` 表示使用放射状渐变，绿色的字体为可变量，由用户自己填写，开始圆的 `x`、`y`、`r` 值均为相对值(0 至 1 范围)。

```js
// example
// 使用渐变色填充，渐变起始圆的圆心坐标为被填充物体的包围盒中心点，半径为(包围盒对角线长度 / 2) 的 0.1 倍，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```

# \<pattern\>

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8FjsSoqE1mYAAAAAAAAAAABkARQnAQ)

- `p`: 表示使用纹理，绿色的字体为可变量，由用户自己填写。
- `a`: 该模式在水平和垂直方向重复；
- `x`: 该模式只在水平方向重复；
- `y`: 该模式只在垂直方向重复；
- `n`: 该模式只显示一次（不重复）。
- 纹理的内容可以直接是图片或者 [Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)。

```js
// example
// 使用纹理填充，在水平和垂直方向重复图片
fill: 'p(a)https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';
```
