---
title: CSS Typed OM
order: 1
---

In the browser, CSS parsing used to be a black box for front-end developers for a long time. We could only interact with the style system via unstructured strings like `el.style.width = '50%'`.

The [CSS Typed OM API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API) allows parsed property values to be manipulated using JS, and it is also [CSS Houdini](https://drafts. css-houdini.org/). In the case of `width: '50%'` above, the attribute value in string form is parsed to `CSS.percent(50)` for the next step in the calculation.

# CSS

We provide a series of quick creation methods on `CSS`.

```js
import { CSS } from '@antv/g';

CSS.number(5);
CSS.px(5);
CSS.em(1.2);
CSS.percent(50);
```

## number()

Create a [CSSUnitValue](/en/api/css/css-typed-om#cssunitvalue) in `UnitType.kNumber`, written in the same way as the following two.

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.number(5);
new CSSUnitValue(5); // The default unit is UnitType.kNumber
```

We use it to store the result of parsing a property value of type [\<number\>](), for example `opacity: 0.5` will be parsed to `CSS.number(0.5)` and stored in `computedStyle.opacity`.

## px()

Create a [CSSUnitValue](/en/api/css/css-typed-om#cssunitvalue) in `UnitType.kPixels`, written in the same way as the following two.

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.px(5);
new CSSUnitValue(5, 'px');
```

We will use it to store the result of parsing a property value of type [\<length\>](/en/api/css/length), for example `r: 50` will be parsed to `CSS.px(50)` and saved in `computedStyle.r`.

## em()

Create a [CSSUnitValue](/en/api/css/css-typed-om#cssunitvalue) in `UnitType.kEms`, written in the same way as the following two.

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.em(5);
new CSSUnitValue(5, 'em');
```

## rem()

Create a [CSSUnitValue](/en/api/css/css-typed-om#cssunitvalue) in `UnitType.kRems`, written in the same way as the following two.

```js
import { CSS, CSSUnitValue } from '@antv/g';

CSS.rem(5);
new CSSUnitValue(5, 'rem');
```

# CSSStyleValue

It is the base class for the following types.

# CSSNumericValue

Inherits from CSSStyleValue and provides a series of mathematical operations.

For example, we can represent the value of a property like `10px + 10%` like this.

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

Reflects what type the property value represents (CSSNumericType), e.g. `<length>`, `<angle>`, etc.

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

Provides conversion between different units. The method signature is as follows.

```js
to(unit: UnitType | string): CSSUnitValue;
```

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/to

For example, to convert between different angular units.

```js
const degValue = new CSSUnitValue(360, 'deg');

expect(degValue.to('deg').value).to.eqls(360);
expect(degValue.to('rad').value).to.eqls(deg2rad(360));
expect(degValue.to('turn').value).to.eqls(deg2turn(360));
```

If the conversion between the current unit and the target unit is not possible (e.g. converting 'px' to 'deg'), null will be returned.

## toSum()

Calculations between different units are completed whenever possible. The method signature is as follows.

```js
toSum(...unit_strings: string[]): CSSMathSum {}
```

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/toSum

For example, we want to simplify the result of the expression by using 'px' and '%'.

```js
let v = CSS.px('20').add(CSS.percent('4')).add(CSS.px('20'));
v.toString(); // => "calc(20px + 4% + 20px)"
v.toSum('px', 'percent').toString(); // => "calc(40px + 4%)"
```

It is important to note that the order of the units passed in affects the value of the final expression: the

```js
const length = new CSSUnitValue(10, 'px');
const percent = new CSSUnitValue(10, '%');
const result = percent.add(length);

expect(result.toString()).toBe('calc(10% + 10px)');
expect(result.toSum('px', 'percent').toString()).toBe('calc(10px + 10%)');
expect(result.toSum('percent', 'px').toString()).toBe('calc(10% + 10px)');
```

## equals()

Both type and value are required to be identical, e.g. both type is `<length>` and both unit is 'px'.

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/equals

## add()

https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/add

```js
let mathSum = CSS.px('23').add(CSS.percent('4'));
// Prints "calc(23px + 4%)"
console.log(mathSum.toString());
```

## sub()

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

Numeric value + unit. Inherited from CSSNumericValue.

We currently support enumerated values in the following units.

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

In addition to using enumeration values when creating, you can also use strings, so the following three ways of writing are consistent.

```js
import { CSS, CSSUnitValue, UnitType } from '@antv/g';

CSS.px(5);
new CSSUnitValue(5, UnitType.kPixels);
new CSSUnitValue(5, 'px');
```

The mapping relationship between enumeration values and strings is as follows.

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

Return to the unit.

## value

Return to the value.

# CSSKeywordValue

Stands for keywords, such as `unset` `initial` `inherit` etc.

https://developer.mozilla.org/en-US/docs/Web/API/CSSKeywordValue

## value

```js
const display = new CSSKeywordValue('initial');
display.value; // 'initial';
```

# CSSColorValue

# CSSRGB

Inherited from CSSColorValue.

```js
const value = new CSSRGB(0, 0, 0);

expect(value.toString()).to.eqls('rgba(0,0,0,1)');
```
