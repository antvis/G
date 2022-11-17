---
title: 继承机制
order: 1
---

在 CSS 中，当没有为属性设置值时，可继承属性将从父元素上获取计算值。

https://developer.mozilla.org/zh-CN/docs/Web/CSS/inheritance

例如 CSS 的 `color` 属性是可继承的，因此对于未设置该属性的 `<em>` 元素，它将使用父元素的值 `green`：

```css
p { color: green; }

<p>This paragraph has <em>emphasized text</em> in it.</p>
```

我们在 G 中实现了一套样式系统，同样支持继承。例如我们创建一个 [Text](/zh/api/basic/text)，并未指定 `fontSize` 或者 `fontFamily` 这些属性，但它依然可以被渲染出来，因为它加入画布后继承了根节点上的默认样式：`fontSize: '16px'; fontFamily: 'sans-serif'`：

```js
const text = new Text({
    style: {
        x: 100,
        y: 100,
        text: 'hello',
    },
});

canvas.appendChild(text);
```

在该[示例](/zh/examples/style#inheritance)中，修改根节点的字号同样会影响到子元素，配合 `rem` 这样的单位我们可以轻松实现“弹性布局”：

```js
canvas.document.documentElement.style.fontSize = `32px`;
```

# 根节点默认样式

和浏览器一样，默认值（[initial value](https://developer.mozilla.org/en-US/docs/Web/CSS/initial_value)）会在根节点上应用可继承属性。

例如浏览器默认的 `fontSize` 是 `16px`。我们在 G 中给[根节点]()设置了如下样式：

```js
expect(documentElement.style.fill).to.equal('');
expect(documentElement.style.fillOpacity).to.equal('1');
expect(documentElement.style.fontFamily).to.equal('sans-serif');
expect(documentElement.style.fontSize).to.equal('16px');
expect(documentElement.style.fontStyle).to.equal('normal');
expect(documentElement.style.fontVariant).to.equal('normal');
expect(documentElement.style.fontWeight).to.equal('normal');
expect(documentElement.style.height).to.equal('');
expect(documentElement.style.lineCap).to.equal('butt');
expect(documentElement.style.lineDashOffset).to.equal('0');
expect(documentElement.style.lineJoin).to.equal('miter');
expect(documentElement.style.lineWidth).to.equal('1');
expect(documentElement.style.opacity).to.equal('');
expect(documentElement.style.stroke).to.equal('');
expect(documentElement.style.strokeOpacity).to.equal('1');
expect(documentElement.style.textTransform).to.equal('none');
expect(documentElement.style.textAlign).to.equal('start');
expect(documentElement.style.textBaseline).to.equal('alphabetic');
expect(documentElement.style.transformOrigin).to.equal('');
expect(documentElement.style.visibility).to.equal('visible');
expect(documentElement.style.pointerEvents).to.equal('auto');
expect(documentElement.style.width).to.equal('');
expect(documentElement.style.x).to.equal(0);
expect(documentElement.style.y).to.equal(0);
expect(documentElement.style.z).to.equal(0);
expect(documentElement.style.zIndex).to.equal(0);
```

# 支持继承的属性

目前我们支持的可继承属性如下：

| 属性名         | 初始值       | 适用元素 | 是否可继承 | 是否支持动画 | computed value          |
| -------------- | ------------ | -------- | ---------- | ------------ | ----------------------- |
| fillOpacity    | '1'          | 所有     | 是         | 是           | `<number>`              |
| strokeOpacity  | '1'          | 所有     | 是         | 是           | `<number>`              |
| lineWidth      | '1'          | 所有     | 是         | 是           | `<length> <percentage>` |
| lineJoin       | 'miter'      | 所有     | 是         | 否           | `<keywords>`            |
| lineCap        | 'butt'       | 所有     | 是         | 否           | `<keywords>`            |
| lineDash       | 无           | 所有     | 是         | 是           | `<array>`               |
| lineDashOffset | '0'          | 所有     | 是         | 是           | `<length> <percentage>` |
| visibility     | 'visible'    | 所有     | 是         | 否           | `<keywords>`            |
| pointerEvents  | 'auto'       | 所有     | 是         | 否           | `<keywords>`            |
| fontSize       | '16px'       | 所有     | 是         | 是           | `<length> <percentage>` |
| fontFamily     | 'sans-serif' | 所有     | 是         | 否           | `<keywords>`            |
| fontStyle      | 'normal'     | 所有     | 是         | 否           | `<keywords>`            |
| fontWeight     | 'normal'     | 所有     | 是         | 否           | `<keywords>`            |
| fontVariant    | 'normal'     | 所有     | 是         | 否           | `<keywords>`            |
| textBaseline   | 'alphabetic' | 所有     | 是         | 否           | `<keywords>`            |
| textAlign      | 'start'      | 所有     | 是         | 否           | `<keywords>`            |
