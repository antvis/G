import { expect } from 'chai';
import { Circle, Dom, Ellipse, Image, Line, Marker, Path, Polygon, Polyline, Rect, Text } from '../../../src/shape';

describe('SVG Shape index', () => {
  it('Every shape is not undefined', () => {
    expect(Circle).not.eqls(undefined);
    expect(Dom).not.eqls(undefined);
    expect(Ellipse).not.eqls(undefined);
    expect(Image).not.eqls(undefined);
    expect(Line).not.eqls(undefined);
    expect(Marker).not.eqls(undefined);
    expect(Path).not.eqls(undefined);
    expect(Polygon).not.eqls(undefined);
    expect(Polyline).not.eqls(undefined);
    expect(Rect).not.eqls(undefined);
    expect(Text).not.eqls(undefined);
  });
});
