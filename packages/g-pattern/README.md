# g-pattern

Refer to [nivo patterns](https://nivo.rocks/guides/patterns/), we provide some built-in patterns, and you can adjust the appearance through more friendly parameters. Currently we support the following three patterns:

-   `dots` Pattern with dots.
-   `lines` Pattern with lines.
-   `squares` Pattern with squares.

The method signatures of these three patterns are as follows, the first parameter is [Canvas](/en/api/canvas/intro), and the second parameter is the style configuration of the pattern:

```ts
dots(canvas: Canvas, cfg?: DotPatternCfg): HTMLCanvasElement;
lines(canvas: Canvas, cfg?: LinePatternCfg): HTMLCanvasElement;
squares(canvas: Canvas, cfg?: SquarePatternCfg): HTMLCanvasElement;
```

In the following [example](/en/examples/ecosystem/pattern/#dots), we choose `dots` and use [transform](/api/css/css-properties-values-api#transform) to rotate and scale it:

```js
import { dots } from '@antv/g-pattern';

rect.style.fill = {
    image: dots(canvas, {
        size: 6,
        padding: 2,
        fill: '#ff0000',
        isStagger: true,
    }),
    repetition: 'repeat',
    transform: `rotate(30deg) scale(1.2)`,
};
```

Common configuration for all types of pattern:

| Attribute       | Type   | Description                                                                                                  |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| backgroundColor | string | Background color of the pattern, default to `'none'`                                                         |
| fill            | string | Fill color of the symbol in pattern, `dots` and `squares` default to `'#fff'`，                              |
| fillOpacity     | number | Transparency of the symbol in pattern, default to `1`                                                        |
| stroke          | string | Stroke color of the symbol in pattern, `dots` and `squares` default to `'none'`, `lines` default to `'#fff'` |
| strokeOpacity   | number | Stroke opacity of the symbol in pattern, default to `1`                                                      |
| lineWidth       | number | The thickness of the symbol's stroke, `dots` and `squares` default to `0`, `lines` default to `2`            |
| opacity         | number | Overall transparency of the pattern, default to `1`                                                          |

Additional configuration for `dots`, [example](/en/examples/ecosystem/pattern/#dots)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*Xce3RrT3zAMAAAAAAAAAAAAADmJ7AQ/original" alt="dots pattern" width="200">

| Attribute | Type    | Description                               |
| --------- | ------- | ----------------------------------------- |
| size      | number  | The size of the dot, default to `6`       |
| padding   | number  | The distance between dots, default to `2` |
| isStagger | boolean | Staggered dots. default to `true`         |

Additional configuration for `lines`, [example](/en/examples/ecosystem/pattern/#lines)：

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*cQp7TrgGMoUAAAAAAAAAAAAADmJ7AQ/original" alt="lines pattern" width="200">

| Attribute | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| spacing   | number | The distance between the two lines, default to `5` |

Additional configuration for `squares`, [example](/en/examples/ecosystem/pattern/#squares):

<img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*JB3lRoeyzdIAAAAAAAAAAAAADmJ7AQ/original" alt="squares pattern" width="200">

| Attribute | Type    | Description                                  |
| --------- | ------- | -------------------------------------------- |
| size      | number  | The size of the square, default to `6`       |
| padding   | number  | The distance between squares, default to `1` |
| isStagger | boolean | Staggered squares. default to `true`         |
