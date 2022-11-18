---
title: CustomElementRegistry
order: 10
---

Usually we recommend using `new Circle()` to create built-in or custom graphics, but we also provide something like the DOM [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/ CustomElementRegistry) API to create a completed registered graph using [document.createElement](/en/api/builtin-objects/document#createelement), so the following writeup is equivalent.

```js
import { Shape, Circle } from '@antv/g';

const circle = canvas.document.createElement(Shape.CIRCLE, {
    style: { r: 100 },
});

// or
const circle = new Circle({ style: { r: 100 } });
```

`canvas.customElements` provides the following methods.

## define

The full method signature is:

```js
define(name: string, new (...any[]) => DisplayObject): void;
```

All of G's built-in graphics are registered during canvas initialization, and for custom graphics, if you also want to create them with the `createElement` method, registration can be done as follows.

```js
import { MyCustomShape } from 'my-custom-shape';
canvas.customElements.define(MyCustomShape.tag, MyCustomShape);

const myCustomShape = canvas.document.createElement(MyCustomShape.tag, {});
```

## get

The full method signature is:

```js
get(name: string): new (...any[]) => DisplayObject
```

Returns the constructor based on the string provided at the time of graphic registration.

```js
import { Shape } from '@antv/g';

canvas.customElements.get(Shape.CIRCLE); // Circle constructor
```
