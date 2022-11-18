---
title: Introduction
order: 0
redirect_from:
    - /en/api/css
---

We use a large number of style attributes in CSS, some of which affect the appearance of an element, and some of which affect the layout of an element.

```css
div {
    display: 'flex'; // 使用 Flex 布局
    color: 'red'; // 字体颜色
    opacity: 0.5;
}
```

A similar `attribute` exists in SVG, for example, to draw a red translucent circle with a radius of 5.

```html
<circle r="5" fill="red" opacity="0.5"></circle>
```

The two overlap in some of their properties and we combine them so that the above effect can be achieved in G as follows:

```js
const circle = new Circle({
    // come from CSS
    style: {
        r: 5, // come from SVG
        fill: 'red', // come from SVG
        opacity: 0.5, // both from SVG & CSS
    },
});
```

In modern browsers, [CSS](https://developer.mozilla.org/en-US/docs/Web/API/CSS) provides a number of APIs to help front-end developers better interact with the "black box" that is the style system.

-   [CSS Typed OM](https://developer.mozilla.org/en-US/docs/Web/Guide/Houdini#css_typed_om) converts user-input strings into JS representations and provides tools such as math operations
-   CSS Properties & Values API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API) supports custom style properties
-   The [CSS Layout API](https://developer.mozilla.org/en-US/docs/Web/Guide/Houdini#css_layout_api) supports custom layouts and implements layout algorithms that are not yet supported in browsers.

We have designed a simple style system (no support for style rules yet) by referring to the implementation of Blink (currently Webkit does not support CSS Typed OM, etc.) to implement the above CSS API. The CSS Properties & Values API registers a set of built-in properties during initialization, which can also be used in custom graphics to register Custom properties. Parsing of properties is done using CSS Typed OM, for example `r: 5` will be parsed as `CSS.px(5)`. If the user sets the layout property `display`, we will use the CSS Layout API to do the layout calculations during the layout phase.

With this style system, we hope to make layout simpler, so that users can avoid complicated manual calculations, use `setPosition()` to set the element position, and do the task easily with the layout property. Imagine all the fancy ways of centering elements before browsers supported `display: flex`.

```js
container.appendChild(child1);
container.appendChild(child2);

// Set the container to use the Flex layout to directly position the child elements
container.style.display = 'flex';

// or Manually perform a series of complex layout calculations
const [x1, y1, x2, y2] = heavyLifting(container, child1, child2);
child1.setPosition(x1, y1);
child2.setPosition(x2, y2);
```

# CSS Typed OM

In the browser, CSS parsing used to be a black box for front-end developers for a long time.

We could only interact with the style system through unstructured strings like `el.style.width = '50%'`.

Different style properties support different types, for example the radius of a circle `r` supports length `<length>` and percentage `<percentage>`, which we can represent as strings.

```js
circle.style.r = '5px';
circle.style.r = '50%';
```

We will parse such strings as [CSSStyleValue](/en/api/css/css-typed-om#cssstylevalue), for example `CSS.px(5)` and `CSS.percent(50)`, for more information see [CSS Typed OM](/en/ docs/api/css/css-typed-om).

# CSS Properties & Values API

Obviously, the metadata of an attribute (whether it can be inherited, whether it supports animations, default values, etc.) affects how we parse the value of the attribute.

# CSS Layout API
