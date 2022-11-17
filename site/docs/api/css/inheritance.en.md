---
title: Inheritance
order: 1
---

In CSS, when no value is set for an attribute, the inheritable attribute will take the calculated value from the parent element.

https://developer.mozilla.org/zh-CN/docs/Web/CSS/inheritance

For example, the `color` property of CSS is inheritable, so for an `<em>` element that does not have this property set, it will use the value of the parent element, `green`.

```css
p { color: green; }

<p>This paragraph has <em>emphasized text</em> in it.</p>
```

We have implemented a style system in G that also supports inheritance. For example, we create a [Text](/en/api/basic/text) without specifying `fontSize` or `fontFamily` properties, but it can still be rendered because it inherits the default style from the root node when added to the canvas: `fontSize: '16px'; fontFamily: 'sans-serif'`.

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

In this [example](/en/examples/style#inheritance), modifying the font size of the root node also affects the child elements, and with units like `rem` we can easily achieve an "elastic layout:"

```js
canvas.document.documentElement.style.fontSize = `32px`;
```

# The default style of root node

As with browsers, the default value ([initial value](https://developer.mozilla.org/en-US/docs/Web/CSS/initial_value)) applies inheritable attributes at the root node.

For example, the browser default `fontSize` is `16px`. We have styled [root node](/en/api/builtin-objects/document#documentelement) in G as follows.

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

# Inherited properties supported

We currently support the following inheritable properties.

| method name    | initial value | element | inheritable | animatable | computed value          |
| -------------- | ------------- | ------- | ----------- | ---------- | ----------------------- |
| fillOpacity    | '1'           | all     | yes         | yes        | `<number>`              |
| strokeOpacity  | '1'           | all     | yes         | yes        | `<number>`              |
| lineWidth      | '1'           | all     | yes         | yes        | `<length> <percentage>` |
| lineJoin       | 'miter'       | all     | yes         | no         | `<keywords>`            |
| lineCap        | 'butt'        | all     | yes         | no         | `<keywords>`            |
| lineDash       | 无            | all     | yes         | yes        | `<array>`               |
| lineDashOffset | '0'           | all     | yes         | yes        | `<length> <percentage>` |
| visibility     | 'visible'     | all     | yes         | no         | `<keywords>`            |
| pointerEvents  | 'auto'        | all     | yes         | no         | `<keywords>`            |
| fontSize       | '16px'        | all     | yes         | yes        | `<length> <percentage>` |
| fontFamily     | 'sans-serif'  | all     | yes         | no         | `<keywords>`            |
| fontStyle      | 'normal'      | all     | yes         | no         | `<keywords>`            |
| fontWeight     | 'normal'      | all     | yes         | no         | `<keywords>`            |
| fontVariant    | 'normal'      | all     | yes         | no         | `<keywords>`            |
| textBaseline   | 'alphabetic'  | all     | yes         | no         | `<keywords>`            |
| textAlign      | 'start'       | all     | yes         | no         | `<keywords>`            |
