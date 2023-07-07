---
title: CSS Typed OM
order: 1
---

在浏览器中，过去很长一段时间 CSS 的解析对于前端开发者都是一个黑盒。我们只能通过 `el.style.width = '50%'` 这样非结构化的字符串与样式系统交互。

[CSS Typed OM API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API) 允许使用 JS 操作解析后的属性值，它也是 [CSS Houdini](https://drafts.css-houdini.org/) 的基础。以上面的 `width: '50%'` 为例，字符串形式的属性值会被解析成 `CSS.percent(50)`，方便进行下一步的计算。

# CSS

我们在 `CSS` 上提供了一系列快捷的创建方法：

```js
import { CSS } from '@antv/g';

CSS.number(5);
CSS.px(5);
CSS.em(1.2);
CSS.percent(50);
```

## number()

创建一个 [CSSUnitValue](/zh/api/css/css-typed-om#cssunitvalue)，单位为 `UnitType.kNumber`，以下两种写法一致：

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.number(5);
new CSSUnitValue(5); // 默认单位就是 UnitType.kNumber
```

我们会用它存储 [\<number\>]() 类型属性值的解析结果，例如 `opacity: 0.5` 会被解析成 `CSS.number(0.5)` 后保存在 `computedStyle.opacity` 中。

## px()

创建一个 [CSSUnitValue](/zh/api/css/css-typed-om#cssunitvalue)，单位为 `UnitType.kPixels`，以下两种写法一致：

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.px(5);
new CSSUnitValue(5, 'px');
```

我们会用它存储 [\<length\>](/zh/api/css/length) 类型属性值的解析结果，例如 `r: 50` 会被解析成 `CSS.px(50)` 后保存在 `computedStyle.r` 中。

## em()

创建一个 [CSSUnitValue](/zh/api/css/css-typed-om#cssunitvalue)，单位为 `UnitType.kEms`，以下两种写法一致：

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.em(5);
new CSSUnitValue(5, 'em');
```

## rem()

创建一个 [CSSUnitValue](/zh/api/css/css-typed-om#cssunitvalue)，单位为 `UnitType.kRems`，以下两种写法一致：

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.rem(5);
new CSSUnitValue(5, 'rem');
```

# CSSStyleValue

它是以下类型的基类。

# CSSNumericValue

继承自 CSSStyleValue。提供一系列数学运算。

例如我们可以这样表示 `10px + 10%` 这样的属性值：

```js
const length = new CSSUnitValue(10, 'px');
const percent = new CSSUnitValue(10, '%');
const result = percent.add(length);

// 字符串表示
expect(result.toString()).toBe('calc(10% + 10px)');
expect(result.toSum('px', 'percent').toString()).toBe('calc(10px + 10%)');
expect(result.toSum('percent', 'px').toString()).toBe('calc(10% + 10px)');
```

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue

## type()

反映该属性值代表何种类型（CSSNumericType），例如 `<length>`、`<angle>` 等等：

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/type

```js
// <number>
const number = new CSSUnitValue(10);
expect(number.type()).to.eqls({
  length: 0,
  angle: 0,
  time: 0,
  frequency: 0,
  resolution: 0,
  flex: 0,
  percent: 0,
  percentHint: 'length',
});

// <length>
const length = new CSSUnitValue(10, 'px');
expect(length.type()).to.eqls({
  length: 1,
  angle: 0,
  time: 0,
  frequency: 0,
  resolution: 0,
  flex: 0,
  percent: 0,
  percentHint: 'length',
});
```

## to()

提供不同单位间的转换。方法签名如下：

```js
to(unit: UnitType | string): CSSUnitValue;
```

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/to

例如在不同角度单位间转换：

```js
const degValue = new CSSUnitValue(360, 'deg');

expect(degValue.to('deg').value).to.eqls(360);
expect(degValue.to('rad').value).to.eqls(deg2rad(360));
expect(degValue.to('turn').value).to.eqls(deg2turn(360));
```

如果当前单位和目标单位间无法进行转换（例如把 'px' 转成 'deg'），会返回 null。

## toSum()

尽可能完成不同单位间的计算。方法签名如下：

```js
toSum(...unit_strings: string[]): CSSMathSum {}
```

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/toSum

例如我们希望简化表达式的计算结果，使用 'px' 和 '%'：

```js
let v = CSS.px('20').add(CSS.percent('4')).add(CSS.px('20'));
v.toString(); // => "calc(20px + 4% + 20px)"
v.toSum('px', 'percent').toString(); // => "calc(40px + 4%)"
```

需要注意的是，传入的单位顺序会影响最终表达式的值：

```js
const length = new CSSUnitValue(10, 'px');
const percent = new CSSUnitValue(10, '%');
const result = percent.add(length);

expect(result.toString()).toBe('calc(10% + 10px)');
expect(result.toSum('px', 'percent').toString()).toBe('calc(10px + 10%)');
expect(result.toSum('percent', 'px').toString()).toBe('calc(10% + 10px)');
```

## equals()

类型和数值都要求完全一致，例如类型都是 `<length>`，单位都是 'px'。

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/equals

## add()

实现加法。

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/add

```js
let mathSum = CSS.px('23').add(CSS.percent('4'));
// Prints "calc(23px + 4%)"
console.log(mathSum.toString());
```

## sub()

实现减法。

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/sub

```js
let mathSum = CSS.px('23').sub(CSS.percent('4'));
// Prints "calc(23px - 4%)"
console.log(mathSum.toString());
```

## mul()

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/mul

## div()

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/div

## min()

## max()

## negate()

## invert()

# CSSUnitValue

数值 + 单位。继承自 CSSNumericValue。

目前我们支持以下单位的枚举值：

```js
export enum UnitType {
  kUnknown,
  // <number>
  kNumber,
  // <percentage>
  kPercentage,
  // <length>
  kEms,
  kRems,
  kPixels,
  // <angle>
  kDegrees,
  kRadians,
  kGradians,
  kTurns,
}
```

在创建时除了使用枚举值，还可以使用字符串，因此以下三种写法一致：

```js
import { CSS, CSSUnitValue, UnitType } from '@antv/g';

CSS.px(5);
new CSSUnitValue(5, UnitType.kPixels);
new CSSUnitValue(5, 'px');
```

枚举值和字符串的映射关系如下：

```js
UnitType.kNumber = 'number';
UnitType.kPercentage = '%' | 'percent';
UnitType.kEms = 'em';
UnitType.kRems = 'rem';
UnitType.kPixels = 'px';
UnitType.kDegrees = 'deg';
UnitType.kRadians = 'rad';
UnitType.kGradians = 'grad';
UnitType.kTurns = 'turn';
```

## unit

返回单位。

## value

返回数值。

# CSSKeywordValue

代表关键词，例如 `unset` `initial` `inherit` 等。

https://developer.mozilla.org/en-US/docs/Web/API/CSSKeywordValue

## value

```js
const display = new CSSKeywordValue('initial');
display.value; // 'initial';
```

# CSSColorValue

# CSSRGB

继承自 CSSColorValue。

```js
const value = new CSSRGB(0, 0, 0);

expect(value.toString()).to.eqls('rgba(0,0,0,1)');
```
