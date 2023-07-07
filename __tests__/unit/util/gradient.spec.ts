import { parseGradient } from '../../../packages/g-lite/src/utils';

describe('Gradient parser', () => {
  it('should parse linear-gradient correctly', () => {
    let ast = parseGradient('linear-gradient(#e66465, #9198e5)');
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'hex', value: 'e66465' },
          { length: undefined, type: 'hex', value: '9198e5' },
        ],
        orientation: undefined,
        type: 'linear-gradient',
      },
    ]);

    // angular
    ast = parseGradient('linear-gradient(0deg, blue, green 40%, red)');
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'literal', value: 'blue' },
          {
            length: { type: '%', value: '40' },
            type: 'literal',
            value: 'green',
          },
          { length: undefined, type: 'literal', value: 'red' },
        ],
        orientation: { type: 'angular', value: '0' },
        type: 'linear-gradient',
      },
    ]);

    // directional
    ast = parseGradient('linear-gradient(to right, blue, green 40%, red)');
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'literal', value: 'blue' },
          {
            length: { type: '%', value: '40' },
            type: 'literal',
            value: 'green',
          },
          { length: undefined, type: 'literal', value: 'red' },
        ],
        orientation: { type: 'directional', value: 'right' },
        type: 'linear-gradient',
      },
    ]);

    // multiple gradients
    ast =
      parseGradient(`linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
    linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
    linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%)`);
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'rgba', value: ['255', '0', '0', '.8'] },
          {
            length: { type: '%', value: '70.71' },
            type: 'rgba',
            value: ['255', '0', '0', '0'],
          },
        ],
        orientation: { type: 'angular', value: '217' },
        type: 'linear-gradient',
      },
      {
        colorStops: [
          { length: undefined, type: 'rgba', value: ['0', '255', '0', '.8'] },
          {
            length: { type: '%', value: '70.71' },
            type: 'rgba',
            value: ['0', '255', '0', '0'],
          },
        ],
        orientation: { type: 'angular', value: '127' },
        type: 'linear-gradient',
      },
      {
        colorStops: [
          { length: undefined, type: 'rgba', value: ['0', '0', '255', '.8'] },
          {
            length: { type: '%', value: '70.71' },
            type: 'rgba',
            value: ['0', '0', '255', '0'],
          },
        ],
        orientation: { type: 'angular', value: '336' },
        type: 'linear-gradient',
      },
    ]);
  });

  it('should parse radial-gradient correctly', () => {
    let ast = parseGradient(
      'radial-gradient(circle at center, red, blue, green 100%)',
    );
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'literal', value: 'red' },
          { length: undefined, type: 'literal', value: 'blue' },
          {
            length: { type: '%', value: '100' },
            type: 'literal',
            value: 'green',
          },
        ],
        orientation: [
          {
            at: {
              type: 'position',
              value: {
                x: { type: 'position-keyword', value: 'center' },
                y: undefined,
              },
            },
            style: undefined,
            type: 'shape',
            value: 'circle',
          },
        ],
        type: 'radial-gradient',
      },
    ]);

    ast = parseGradient('radial-gradient(red, blue, green)');
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'literal', value: 'red' },
          { length: undefined, type: 'literal', value: 'blue' },
          { length: undefined, type: 'literal', value: 'green' },
        ],
        orientation: undefined,
        type: 'radial-gradient',
      },
    ]);

    // multiple radial gradients
    ast = parseGradient(
      'radial-gradient(red, blue, green), radial-gradient(red, blue, green)',
    );
    expect(ast).toStrictEqual([
      {
        colorStops: [
          { length: undefined, type: 'literal', value: 'red' },
          { length: undefined, type: 'literal', value: 'blue' },
          { length: undefined, type: 'literal', value: 'green' },
        ],
        orientation: undefined,
        type: 'radial-gradient',
      },
      {
        colorStops: [
          { length: undefined, type: 'literal', value: 'red' },
          { length: undefined, type: 'literal', value: 'blue' },
          { length: undefined, type: 'literal', value: 'green' },
        ],
        orientation: undefined,
        type: 'radial-gradient',
      },
    ]);
  });

  // it('should parse conic-gradient correctly', () => {
  //   let ast = parseGradient('conic-gradient(red 0deg, blue, green)');
  //   expect(ast).toBe(0);

  //   [
  //     {
  //       colorStops: [
  //         { length: undefined, type: 'literal', value: 'red' },
  //         { length: undefined, type: 'literal', value: 'blue' },
  //         { length: undefined, type: 'literal', value: 'green' },
  //       ],
  //       orientation: undefined,
  //       type: 'conic-gradient',
  //     },
  //   ];
  // });
});
