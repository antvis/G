---
title: <color>
order: 1
---

参考 CSS 规范中对于 [\<color\>](https://www.w3.org/TR/css-color-3/#valuea-def-color) 类型的定义，我们支持以下颜色值类型，它们都以 JS 中的 `string` 类型存在。

它是 [\<paint\>](/zh/docs/api/css/painting) 的子集。

<!-- 目前会使用该类型的属性有：

- [fill]() 填充色
- [stroke]() 描边色 -->

# 基础颜色关键词

CSS 定义了一系列基础的颜色关键词，它们都是**大小写敏感**的。下左图展示基础的颜色关键词，下右图为部分扩展的关键词。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*NFB5T69VUUwAAAAAAAAAAAAAARQnAQ" width="300"/>
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PKSDR4_nEgIAAAAAAAAAAAAAARQnAQ" width="300"/>

在内部实现中，我们会把关键词字符串传给 [d3-color](https://github.com/d3/d3-color) 解析，得到 [CSSRGB]()。

使用示例如下：

```js
circle.style.fill = 'red';
circle.style.fill = 'darkcyan';
```

# 数值类型

## rgb

定义在 [sRGB](https://www.w3.org/TR/css-color-3/#ref-SRGB) 颜色空间，支持十六进制写法。

使用示例如下：

```js
circle.style.fill = '#f00';
circle.style.fill = '#ff0000';
circle.style.fill = 'rgb(255,0,0)';
circle.style.fill = 'rgb(100%, 0%, 0%)';
```

## rgba

在 `rgb` 基础上增加透明度通道。按照[规范](https://www.w3.org/TR/css-color-3/#alphavaluedt)，`alpha` 取值范围为 `[0, 1]`。

使用示例如下：

```js
circle.style.fill = 'rgb(255,0,0)';
circle.style.fill = 'rgba(255,0,0,1)';
circle.style.fill = 'rgba(100%,0%,0%,1)';
```

## transparent

等同于 `rgba(0,0,0,0)` 即完全透明的黑色。

注意它和 [\<paint\>](/zh/docs/api/css/painting) 支持的 `none` 是不同的含义。

## hsl

暂不支持。

## hsla

暂不支持。

# currentColor

https://www.w3.org/TR/css-color-3/#currentcolor
