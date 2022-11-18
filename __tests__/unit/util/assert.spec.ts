import chai, { expect } from 'chai';
import {
  isFunction,
  DCHECK,
  DCHECK_EQ,
  DCHECK_NE,
  definedProps,
  formatAttributeName,
} from '../../../packages/g-lite/src/utils';
import chaiAlmost from 'chai-almost';
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Assert utils', () => {
  it('should check isFunction correctly', () => {
    expect(isFunction(undefined)).to.be.false;
    expect(isFunction(null)).to.be.false;
    expect(isFunction('')).to.be.false;
    expect(isFunction(() => {})).to.be.true;
    expect(isFunction(async () => {})).to.be.true;
  });

  it('should assert correctly', () => {
    expect(() => DCHECK(true)).to.not.throw();
    expect(() => DCHECK(false)).to.throw();
    expect(() => DCHECK_EQ(1, 1)).to.not.throw();
    expect(() => DCHECK_EQ(1, 2)).to.throw();
    expect(() => DCHECK_NE(1, 1)).to.throw();
    expect(() => DCHECK_NE(1, 2)).to.not.throw();
  });

  it('should definedProps correctly', () => {
    expect(definedProps({ a: 1, b: undefined })).to.be.eqls({ a: 1 });
  });

  it('should formatAttributeName correctly', () => {
    expect(formatAttributeName('fill')).to.be.eqls('fill');
    expect(formatAttributeName('d')).to.be.eqls('path');
    expect(formatAttributeName('path')).to.be.eqls('path');
    expect(formatAttributeName('strokeDasharray')).to.be.eqls('lineDash');
    expect(formatAttributeName('strokeWidth')).to.be.eqls('lineWidth');
    expect(formatAttributeName('textAnchor')).to.be.eqls('textAlign');
    expect(formatAttributeName('src')).to.be.eqls('img');
  });
});
