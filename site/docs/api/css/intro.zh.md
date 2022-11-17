---
title: 简介
order: 0
redirect_from:
    - /zh/api/css
---

我们在 CSS 中会使用到大量的样式属性（`style`），有些会影响元素的外观，有些会影响元素的布局：

```css
div {
    display: 'flex'; // 使用 Flex 布局
    color: 'red'; // 字体颜色
    opacity: 0.5;
}
```

在 SVG 中同样存在类似的属性（`attribute`），例如绘制一个半径为 5 的红色半透明圆形：

```html
<circle r="5" fill="red" opacity="0.5" />
```

两者在部分属性上存在重合，我们将其结合，因此在 G 中实现上述效果可以这么做：

```js
const circle = new Circle({
    // 从 CSS 中而来
    style: {
        r: 5, // 从 SVG 属性中来
        fill: 'red', // 从 SVG 属性中来
        opacity: 0.5, // 两者的重合属性
    },
});
```

在现代浏览器中，[CSS](https://developer.mozilla.org/en-US/docs/Web/API/CSS) 提供了一系列 API 帮助前端开发者更好地与样式系统这个“黑盒”交互：

-   [CSS Typed OM](https://developer.mozilla.org/en-US/docs/Web/Guide/Houdini#css_typed_om) 将用户传入的字符串转换成 JS 表示，并提供数学运算等工具方法
-   [CSS Properties & Values API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API) 支持自定义样式属性
-   [CSS Layout API](https://developer.mozilla.org/en-US/docs/Web/Guide/Houdini#css_layout_api) 支持自定义布局，实现浏览器中还不支持的布局算法。

我们参考了 Blink（目前 Webkit 还不支持 CSS Typed OM 等）的实现，设计了一套简易的样式系统（暂不支持样式规则），实现了以上 CSS API。初始化时通过 CSS Properties & Values API 注册了一系列内置属性，在自定义图形中也可以用该方式注册自定义属性。在解析属性时使用 CSS Typed OM 完成，例如 `r: 5` 会被解析成 `CSS.px(5)`。如果用户设置了布局属性 `display`，我们会在布局阶段使用 CSS Layout API 完成布局计算。

我们希望通过这一套样式系统，让布局变得更简单，用户完全可以避免复杂的手动计算、使用 `setPosition()` 设置元素位置，通过布局属性轻松完成任务。想象一下在浏览器支持 `display: flex` 之前，那些让元素居中的奇技淫巧：

```js
container.appendChild(child1);
container.appendChild(child2);

// 设置容器使用 Flex 布局，直接完成子元素的定位
container.style.display = 'flex';

// or 手动进行一系列复杂的布局计算
const [x1, y1, x2, y2] = heavyLifting(container, child1, child2);
child1.setPosition(x1, y1);
child2.setPosition(x2, y2);
```

# CSS Typed OM

在浏览器中，过去很长一段时间 CSS 的解析对于前端开发者都是一个黑盒。

我们只能通过 `el.style.width = '50%'` 这样非结构化的字符串与样式系统交互。

不同的样式属性支持不同的类型，例如圆的半径 `r` 支持长度 `<length>` 和百分比 `<percentage>`，我们可以使用字符串表示：

```js
circle.style.r = '5px';
circle.style.r = '50%';
```

我们会将这样的字符串解析成 [CSSStyleValue](/zh/api/css/css-typed-om#cssstylevalue)，例如 `CSS.px(5)` 和 `CSS.percent(50)`，更多信息详见 [CSS Typed OM](/zh/api/css/css-typed-om)。

# CSS Properties & Values API

显然，一个属性的元数据（是否可以继承、是否支持动画、默认值等）会影响到我们对于属性值的解析。

# CSS Layout API
