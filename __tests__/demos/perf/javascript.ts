import * as lil from 'lil-gui';
import { type Canvas } from '@antv/g';
import * as tinybench from 'tinybench';
import { isNil } from '@antv/util';

export async function javascript(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas } = context;
  console.log(canvas);

  await canvas.ready;

  // benchmark
  // ----------
  const bench = new tinybench.Bench({
    name: 'javascript benchmark',
    time: 1e3,
  });
  const array = [
    'stroke',
    'shadowType',
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowBlur',
    'lineWidth',
    'increasedLineWidthForHitTesting',
    'lineJoin',
    'lineCap',
    'dx',
    'dy',
    'filter',
    'textPathStartOffset',
    'transformOrigin',
    'cx',
    'cy',
    'cz',
    'r',
    'rx',
    'ry',
    'x',
    'y',
    'z',
    'width',
    'height',
    'radius',
    'x1',
    'y1',
    'z1',
    'x2',
    'y2',
    'z2',
    'd',
    'points',
    'text',
    'textTransform',
    'font',
    'fontSize',
    'fontFamily',
    'fontStyle',
    'fontWeight',
    'fontVariant',
    'lineHeight',
    'letterSpacing',
    'miterLimit',
    'wordWrap',
    'wordWrapWidth',
    'maxLines',
    'textOverflow',
    'leading',
    'textBaseline',
    'textAlign',
    'markerStartOffset',
    'markerEndOffset',
  ];
  const object = { stroke: '', fill: '' };

  // bench.add('for', async () => {
  //   for (let i = 0; i < array.length; i++) {
  //     if (array[i] in object) {
  //       break;
  //     }
  //   }
  // });
  // bench.add('for & typeof', async () => {
  //   for (let i = 0; i < array.length; i++) {
  //     if (typeof object[array[i]] !== 'undefined') {
  //       break;
  //     }
  //   }
  // });
  // bench.add('object.keys', async () => {
  //   Object.keys(object).some((name) => array.includes(name));
  // });
  // bench.add('array.some', async () => {
  //   array.some((name) => name in object);
  // });

  // const value = '';
  // bench.add('typeof - isNil', async () => {
  //   !(typeof value === 'undefined' || value === null);
  // });

  // region attr assign ---------------------------------------
  // Performance comparison: direct property access vs method calls
  class TestClass {
    public prop1: number = 0;
    private _prop2: number = 0;

    setProp2(value: number) {
      this._prop2 = value;
    }

    getProp2() {
      return this._prop2;
    }
  }

  const testObj = new TestClass();
  const iterations = 1000000;

  bench.add('attr assign - Direct property assignment', () => {
    for (let i = 0; i < iterations; i++) {
      testObj.prop1 = i;
    }
  });

  bench.add('attr assign - Method call assignment', () => {
    for (let i = 0; i < iterations; i++) {
      testObj.setProp2(i);
    }
  });

  bench.add('attr assign - Direct property access', () => {
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += testObj.prop1;
    }
    return sum;
  });

  bench.add('attr assign - Method call access', () => {
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += testObj.getProp2();
    }
    return sum;
  });
  // endregion ---------------------------------------

  // region typeof ---------------------------------------
  const testTypeof = undefined;
  bench.add('typeof - typeof', async () => {
    typeof testTypeof !== 'undefined';
  });
  bench.add('typeof - !==', async () => {
    testTypeof !== undefined;
  });
  // endregion ---------------------------------------

  // bench.add('@antv/util - isNil', async () => {
  //   !isNil(value);
  // });

  const stringKey = 'fill';
  const objectKey = { a: 1 };
  const map = new Map();
  bench.add('Map set - stringKey', async () => {
    map.set(stringKey, 1);
  });
  bench.add('Map set - objectKey', async () => {
    map.set(objectKey, 1);
  });

  await bench.run();

  console.table(bench.table());

  // ----------
}
