import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { isString, isUndefined, isNil, isNumber, isFunction, isBoolean, isObject } from '@antv/g';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Assert utils', () => {
  it('should check isUndefined correctly', () => {
    expect(isUndefined(undefined)).to.be.true;
    expect(isUndefined(null)).to.be.false;
    expect(isUndefined('')).to.be.false;
    expect(isUndefined(0)).to.be.false;
  });

  it('should check isNil correctly', () => {
    expect(isNil(undefined)).to.be.true;
    expect(isNil(null)).to.be.true;
    expect(isNil('')).to.be.false;
    expect(isNil(0)).to.be.false;
  });

  it('should check isBoolean correctly', () => {
    expect(isBoolean(false)).to.be.true;
    expect(isBoolean(true)).to.be.true;
    expect(isBoolean('')).to.be.false;
    expect(isBoolean(0)).to.be.false;
    expect(isBoolean(undefined)).to.be.false;
    expect(isBoolean(null)).to.be.false;
  });

  it('should check isObject correctly', () => {
    expect(isObject(undefined)).to.be.false;
    expect(isObject(null)).to.be.false;
    expect(isObject('')).to.be.false;
    expect(isObject(0)).to.be.false;
    expect(isObject({})).to.be.true;
  });

  it('should check isNumber correctly', () => {
    expect(isNumber(undefined)).to.be.false;
    expect(isNumber(null)).to.be.false;
    expect(isNumber('')).to.be.false;
    expect(isNumber(0)).to.be.true;
    expect(isNumber(Infinity)).to.be.true;
    expect(isNumber(-Infinity)).to.be.true;
  });

  it('should check isFunction correctly', () => {
    expect(isFunction(undefined)).to.be.false;
    expect(isFunction(null)).to.be.false;
    expect(isFunction('')).to.be.false;
    expect(isFunction(() => {})).to.be.true;
  });

  it('should check isString correctly', () => {
    expect(isString('')).to.be.true;
    expect(isString('xx')).to.be.true;
    expect(isString(2)).to.be.false;
    expect(isString(undefined)).to.be.false;
    expect(isString(null)).to.be.false;
    expect(isString({})).to.be.false;
    expect(isString([])).to.be.false;
  });
});
