import Base from '../../src/abstract/base';
const expect = require('chai').expect;

describe('base test', () => {
  it('init', () => {
    const base = new Base({
      a: 'a',
      b: 'b'
    });
    expect(base.cfg).eqls({
      a: 'a',
      b: 'b'
    });
  });
  it('get', () => {
    const base = new Base({
      a: 'a',
      b: 'b'
    });
    expect(base.get('a')).equal('a');
    expect(base.get('b')).equal('b');
    expect(base.get('c')).equal(undefined);
  });
  it('set', () => {
    const base = new Base({
      a: 'a',
      b: 'b'
    });
    base.set('a', 'a1');
    base.set('c', 'c1');
    expect(base.get('a')).equal('a1');
    expect(base.get('b')).equal('b');
    expect(base.get('c')).equal('c1');
  });
  it('destroy', () => {
    const base = new Base({
      a: 'a',
      b: 'b'
    });
    expect(base.destroyed).equal(false);
    base.destroy();
    expect(base.cfg).eqls({ destroyed: true });
    expect(base.destroyed).equal(true);
  });
});
