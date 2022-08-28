import chai, { expect } from 'chai';
import chaiAlmost from 'chai-almost';
import sinonChai from 'sinon-chai';
import { convertToDash, EasingFunctions } from '../';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Custom easing utils', () => {
  it('should convertToDash correctly', () => {
    expect(convertToDash('easeIn')).to.be.eqls('ease-in');
    expect(convertToDash('ease-in')).to.be.eqls('ease-in');
  });

  it('should calc easing correctly.', () => {
    Object.keys(EasingFunctions).forEach((key) => {
      if (key !== 'bezier' && key !== 'cubic-bezier') {
        const easing = EasingFunctions[key];
        expect(easing(0)).to.be.almost.eqls(0);
        expect(easing(1)).to.be.almost.eqls(1);
      }
    });
  });
});
