---
title: CustomElementRegistry
order: 10
---

通常我们建议使用 `new Circle()` 这样的方式创建内置或者自定义图形，但我们也提供了类似 DOM [CustomElementRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry) API，可以使用 [document.createElement](/zh/api/builtin-objects/document#createelement) 创建完成注册的图形，因此以下写法等价：

```js
import { Shape, Circle } from '@antv/g';

const circle = canvas.document.createElement(Shape.CIRCLE, {
    style: { r: 100 },
});

// 或者
const circle = new Circle({ style: { r: 100 } });
```

`canvas.customElements` 提供了以下方法。

## define

完整方法签名为：

```js
define(name: string, new (...any[]) => DisplayObject): void;
```

所有 G 的内置图形在画布初始化时都完成了注册，对于自定义图形，如果也想通过 createElement 的方法创建，也可以按如下方式完成注册：

```js
import { MyCustomShape } from 'my-custom-shape';
canvas.customElements.define(MyCustomShape.tag, MyCustomShape);

const myCustomShape = canvas.document.createElement(MyCustomShape.tag, {});
```

## get

完整方法签名为：

```js
get(name: string): new (...any[]) => DisplayObject
```

根据图形注册时提供的字符串，返回构造函数：

```js
import { Shape } from '@antv/g';

canvas.customElements.get(Shape.CIRCLE); // Circle constructor
```
