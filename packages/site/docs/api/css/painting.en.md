---
title: <paint>
order: 2
---

参考 SVG 中的 [\<paint\>](https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint)，它是以下类型的并集：

```js
<paint> = none | <color> | <gradient> | <pattern>
```

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

# color

见 [\<color\>](/zh/docs/api/css/color)

# gradient
