---
title: CSS Properties & Values API
order: 2
---

With [CSS Typed OM](/en/api/css/css-typed-om) we can easily define property values such as `CSS.px(5)`, but properties don't only have values.

The [CSS Properties & Values API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API) in the browser allows users to customize CSS properties and configure their types for checks, default values, whether inheritance is supported, and other metadata, which is also part of CSS Houdini.

For example, the following shows how to customize a color property.

```js
window.CSS.registerProperty({
  name: '--my-color',
  syntax: '<color>',
  inherits: false,
  initialValue: '#c0ffee',
});
```

We have also implemented this API in G, defining a set of built-in property value types.

# Property Value Type

CSS property values contain various types: https://drafts.csswg.org/css-values-4/

In G we support the following types.

- Keywords, such as `unset` `center`
- Numeric value, such as:
  - \<color\> e.g. `red`
  - \<paint\> e.g. `transparent` `linear-gradient`
  - \<percentage\> e.g. `%`
  - \<number\> Pure Digital
  - \<length\> Length values with units, e.g. `px` `em` `rem`
  - \<angle\> Angular values with units, e.g. `deg` `rad` `turn`

In some scenarios, these types can be combined, e.g. \<length-percentage\> is a combination of \<length\> and \<percentage\>.

## Keywords

Corresponds to [CSSKeywordValue](/en/api/css/css-typed-om#csskeywordvalue) in [CSS Typed OM](/en/api/css/css-typed-om).

For example, `'normal'` will be parsed as

```js
text.style.fontWeight = 'normal';

const styleMap = text.computedStyleMap();
styleMap.get('fontWeight'); // CSSKeywordValue { value: 'normal' }
```

As with CSS, the global keywords are as follows.

### initial

It can be used to reset inherited properties.

For example, in the following example, `<em>` should have inherited the `color` attribute defined by `<p>`, but it overrides the inherited value by applying the default value (black) via `initial`.

```css
p {
  color: red;
}
em {
  color: initial;
}

<p>
  <span>This text is red.</span>
  <em>This text is in the initial color (typically black).</em>
  <span>This is red again.</span>
</p>
```

https://developer.mozilla.org/en-US/docs/Web/CSS/initial

### inherit

https://developer.mozilla.org/en-US/docs/Web/CSS/inherit

### unset

https://developer.mozilla.org/en-US/docs/Web/CSS/unset

## \<number\>

Corresponds to [CSSUnitValue](/en/api/css/css-typed-om#cssunitvalue) in [CSS Typed OM](/en/api/css/css-typed-om).

Property values that currently use this type include.

- [opacity](/en/api/basic/display-object#opacity)
- [fillOpacity](/en/api/basic/display-object#fillopacity)
- [strokeOpacity](/en/api/basic/display-object#strokeopacity)

```js
circle.style.opacity = '0.5';

const styleMap = circle.computedStyleMap();
styleMap.get('opacity'); // CSSUnitValue { unit:'', value: 0.5 }
```

## \<length\>

The length type is used to define distances, which in turn include absolute and relative types.

https://drafts.csswg.org/css-values-4/#length-value

### px

Pixels are obviously an absolute unit, and if a length value uses `number` the default unit is `px`. It is then resolved to `CSS.px()`.

```js
circle.style.r = 10;
// or
circle.style.r = '10px';

const styleMap = circle.computedStyleMap();
styleMap.get('r'); // CSSUnitValue { unit: 'px', value: 10 }
```

### rem

Represents the font-size of the root element. When used within the root element font-size, it represents its initial value (a common browser default is 16px, but user-defined preferences may modify this).

### em

Represents the calculated font-size of the element. If used on the font-size property itself, it represents the inherited font-size of the element.

## \<percentage\>

https://drafts.csswg.org/css-values-4/#percentage-value

## \<angle\>

https://drafts.csswg.org/css-values-4/#angle-value

### deg

Represents an angle in degrees. One full circle is 360deg. Examples: 0deg, 90deg, 14.23deg.

### grad

Represents an angle in gradians. One full circle is 400grad. Examples: 0grad, 100grad, 38.8grad.

### rad

Represents an angle in radians. One full circle is 2π radians which approximates to 6.2832rad. 1rad is 180/π degrees. Examples: 0rad, 1.0708rad, 6.2832rad.

### turn

Represents an angle in a number of turns. One full circle is 1turn. Examples: 0turn, 0.25turn, 1.2turn.

## \<color\>

Referring to the CSS specification definition of the type [\<color\>](https://www.w3.org/TR/css-color-3/#valuea-def-color), we support the following color value types, which exist as `string` types in JS.

It is a type included in [\<paint\>](/en/api/css/painting).

[examples](/en/examples/style#color).

Properties that would currently use this type are.

- [shadowColor](/en/api/basic/display-object#shadowcolor)

### Basic color keywords

CSS defines a series of basic color keywords that are **case sensitive**. The image below left shows the basic color keywords, and the image below right shows some of the extended keywords.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*NFB5T69VUUwAAAAAAAAAAAAAARQnAQ" width="300"/>
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PKSDR4_nEgIAAAAAAAAAAAAAARQnAQ" width="300"/>

In the internal implementation, we will pass the keyword string to [d3-color](https://github.com/d3/d3-color) to parse it and get [CSSRGB](/en/api/css/css-typed-om#cssrgb).

Example usage is as follows.

```js
circle.style.fill = 'red';
circle.style.fill = 'darkcyan';
```

### Numeric Type

#### rgb

Defined in the [sRGB](https://www.w3.org/TR/css-color-3/#ref-SRGB) color space and supports hexadecimal writing.

Usage examples are as follows.

```js
circle.style.fill = '#f00';
circle.style.fill = '#ff0000';
circle.style.fill = 'rgb(255,0,0)';
circle.style.fill = 'rgb(100%, 0%, 0%)';
```

#### rgba

Adds a transparency channel to `rgb`. According to [specification](https://www.w3.org/TR/css-color-3/#alphavaluedt), `alpha` takes values in the range `[0, 1]`.

Usage examples are as follows.

```js
circle.style.fill = 'rgb(255,0,0)';
circle.style.fill = 'rgba(255,0,0,1)';
circle.style.fill = 'rgba(100%,0%,0%,1)';
```

#### transparent

Equivalent to `rgba(0,0,0,0)` i.e. completely transparent black.

Note that it has a different meaning than `none` supported by [\<paint\>](/en/api/css/css-properties-values-api#paint).

#### [WIP] hsl

#### [WIP] hsla

### currentColor

https://www.w3.org/TR/css-color-3/#currentcolor

Equivalent to black in the Canvas / WebGL rendering environment, and the same name property effect in SVG.

## \<gradient\>

## \<pattern\>

## \<paint\>

Referring to [\<paint\>](https://www.w3.org/TR/SVG/painting.html#SpecifyingPaint) in SVG, it is a concatenation of the following types.

```js
<paint> = none | <color> | <gradient> | <pattern>
```

[Example](/en/examples/style#paint)。

The following properties are currently in use.

- [fill](/en/api/basic/display-object#fill)
- [stroke](/en/api/basic/display-object#stroke)

### none

Not using any color is not equal to [\<color\>](/en/api/css/css-properties-values-api#color) of [transparent](/en/api/css/css-properties-values-api #transparent) keyword. In the case of the `fill` property, for example, both are visually identical, but setting it to `'transparent'` will still pick it up, while setting it to `'none'` will not.

For example, when a drawing is initialized without the `fill` attribute set, it is equivalent to manually changing it to `none` after creation.

```js
const circle = new Circle({
  r: 150,
});

circle.style.fill = 'none';
```

# Attribute Metadata

All CSS property metadata in Blink is defined in a JSON list, which describes how the style system should parse and calculate style values.

The attribute metadata contains the following key information.

- The name of the property. For example, fill width r
- Value parser. Different attribute values naturally require different parsers, for example fill stroke can share a color parser. Note that we only need to implement parsing for "values", not implementations like https://github.com/csstree/csstree.
- Whether interpolation is supported. If not, smooth transitions in the animation system are not possible. https://drafts.csswg.org/css-values-4/#combining-values
- Whether or not inheritance is supported. For example font-size needs to be supported. There are a number of similar tricks in D3.
- Whether it is independent or not. For example visibility is not, and ancestor nodes need to be taken into account to get the final calculated value.
- Default value. For example, the default value for fill is black (SVG specification)
- Keyword list. For example, the width property supports the auto keyword.
- Alias list. For example, the alias for line-width is stroke-width.

## initial value

The defaults have a different definition of "whether the property supports inheritance".

https://developer.mozilla.org/en-US/docs/Web/CSS/initial_value

> - For inherited properties, the initial value is used on the root element only, as long as no specified value is supplied.
> - For non-inherited properties, the initial value is used on all elements, as long as no specified value is supplied.

Therefore, for the root node of G, all `inherited` attributes need to be set to their default values at creation time, e.g. `visibility` is defined in the attribute metadata as follows, and it supports inheritance.

```js
{
  name: 'visibility',
  keywords: ['visible', 'hidden'],
  inherited: true,
  interpolable: true,
  defaultValue: 'visible',
  handler: CSSPropertyVisibility,
}
```

Since inheritance is supported, the child element will be `visible` by default, even if `visibility` has not been set.

## computed value

The parsing of property values goes through the following stages.

- The original value (usually a string) is converted to a CSSStyleUnit, called computed value
- The computed value is calculated to get the used value

https://developer.mozilla.org/en-US/docs/Web/CSS/computed_value

In this step it is necessary to.

- Handle special keywords (usually generic), e.g. [initial](/en/api/css/css-properties-values-api#initial) [inherit](/en/api/css/css-properties-values- api#inherit)
- Do some value calculations, except for those that require the layout phase to be involved

The computed value map can be obtained via the [computedStyleMap](/en/api/builtin-objects/element#computedstylemap) method, which is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) type.

```js
/**
 * computed values
 */
const styleMap = circle.computedStyleMap();

expect((styleMap.get('r') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
const fill = styleMap.get('fill') as CSSRGB;
expect(fill.r).toBe(255);
expect(fill.g).toBe(0);
expect(fill.b).toBe(0);
expect(fill.alpha).toBe(1);
```

However, the computed value cannot be used directly for rendering, e.g., percentages, relative lengths need to be further calculated.

## used value

https://developer.mozilla.org/en-US/docs/Web/CSS/used_value

The computed value is further processed to get the value that will eventually be fed into the rendering pipeline.

For example `CSS.percent(50)` needs to be computed to get `CSS.px(?) `.

# Custom Properties

Define the new property in CSS as follows.

https://developer.mozilla.org/en-US/docs/Web/API/CSS/RegisterProperty

```js
CSS.registerProperty({
  name: '--my-color',
  syntax: '<color>',
  inherits: false,
  initialValue: '#c0ffee',
});
```

This property can then be used in CSS. One of the more critical ones is `syntax`, the limitation being that you can only use the browser's built-in implementation and can't really do custom parsing in the true sense.

In this [example](/en/examples/style#custom-property), we register several different types of custom properties, allowing them to support interpolation.

```js
import { CSS, PropertySyntax } from '@antv/g';

// Register custom properties
CSS.registerProperty({
  name: 'myNumber',
  syntax: PropertySyntax.NUMBER, // Using the built-in "number" parser
  initialValue: '0',
  interpolable: true, // Support interpolation during animation
});

// Apply animations to custom properties
const animation = myCustomElement.animate(
  [
    {
      myNumber: 0,
    },
    {
      myNumber: 1,
    },
  ],
  { duration: 2000, fill: 'both' },
);
```

## name

The name of the attribute in string form. It needs to be globally unique and cannot conflict with built-in properties, and can be prefixed with a namespace.

## inherits

Whether to support inheritance.

## initialValue

Default value.

## interpolate

If or not interpolation is supported. Only supported to apply [animation](/en/api/animation/waapi).

For example, in the following custom element, we define the custom attribute `angle`, which uses the `<angle>` parser and supports interpolation.

```js
CSS.registerProperty({
  name: 'angle',
  syntax: PropertySyntax.ANGLE,
  initialValue: '0',
  interpolable: true,
});
```

## syntax

We currently support the following parsers.

```js
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type
 */
export enum PropertySyntax {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#coordinate
   */
  COORDINATE = '<coordinate>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#color
   */
  COLOR = '<color>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#paint
   */
  PAINT = '<paint>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number
   */
  NUMBER = '<number>',
  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/angle
   */
  ANGLE = '<angle>',
  /**
   * <number> with range 0..1
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#opacity_value
   */
  OPACITY_VALUE = '<opacity-value>',
  /**
   * <number> with range 0..Infinity
   */
  SHADOW_BLUR = '<shadow-blur>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#length
   */
  LENGTH = '<length>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#percentage
   */
  PERCENTAGE = '<percentage>',
  LENGTH_PERCENTAGE = '<length> | <percentage>',

  LENGTH_PERCENTAGE_12 = '[<length> | <percentage>]{1,2}',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin#formal_syntax
   */
  LENGTH_PERCENTAGE_14 = '[<length> | <percentage>]{1,4}',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#list-of-ts
   */
  LIST_OF_POINTS = '<list-of-points>',
  PATH = '<path>',
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/filter#formal_syntax
   */
  FILTER = '<filter>',
  Z_INDEX = '<z-index>',
  OFFSET_PATH = '<offset-path>',
  OFFSET_DISTANCE = '<offset-distance>',
  CLIP_PATH = '<clip-path>',
  TRANSFORM = '<transform>',
  TRANSFORM_ORIGIN = '<transform-origin>',
  TEXT = '<text>',
  TEXT_TRANSFORM = '<text-transform>',
}
```
