import { expect } from 'chai';
import Text from '../../../src/shape/text';
import getCanvas from '../../get-canvas';

describe('SVG text', () => {
  let canvas;
  let text;

  before(() => {
    canvas = getCanvas('svg-text');
    text = new Text({
      attrs: {
        x: 100,
        y: 100,
        text: 'Hello World',
        stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
      },
    });
    canvas.add(text);
  });

  it('init', () => {
    expect(text.attr('x')).eql(100);
    expect(text.attr('y')).eql(100);
    expect(text.attr('text')).eql('Hello World');
    expect(text.attr('stroke')).eql('l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff');
    expect(text.attr('fontSize')).eql(12);
    expect(text.attr('fontFamily')).eql('sans-serif');
    expect(text.attr('textAlign')).eql('start');
    expect(text.attr('textBaseline')).eql('bottom');
  });

  it('autoDraw', () => {
    expect(text.get('el')).not.eql(undefined);
    expect(text.get('el').getAttribute('x')).eql('100');
  });

  it('bbox', () => {
    const bbox = text.getBBox();
    const textBBox = text.cfg.el.getBBox();
    expect(bbox.minX).eql(textBBox.x - 0.5);
    expect(bbox.minY).eql(textBBox.y - 0.5);
    expect(bbox.maxX).eqls(textBBox.x + textBBox.width + 0.5);
    expect(bbox.maxY).eqls(textBBox.y + textBBox.height + 0.5);
  });

  it('change', () => {
    expect(text.attr('fontSize')).eql(12);
    text.attr('fontSize', 40);
    expect(text.attr('fontSize')).eql(40);
    const bbox = text.getBBox();
    const textBBox = text.cfg.el.getBBox();
    expect(bbox.minX).eql(textBBox.x - 0.5);
    expect(bbox.minY).eql(textBBox.y - 0.5);
    expect(bbox.maxX).eqls(textBBox.x + textBBox.width + 0.5);
    expect(bbox.maxY).eqls(textBBox.y + textBBox.height + 0.5);
  });

  it('destroy', () => {
    expect(text.destroyed).eql(false);
    text.destroy();
    expect(text.destroyed).eql(true);
  });
});
