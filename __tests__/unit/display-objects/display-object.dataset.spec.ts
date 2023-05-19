import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import { Group, runtime } from '@antv/g';
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

runtime.enableDataset = true;

describe('DisplayObject dataset API', () => {
  it('should setAttribute data-* with dataset API', () => {
    const group = new Group();

    group.dataset.testProp = 1;
    expect(group.dataset.testProp).eqls(1);
    expect(group.getAttribute('data-test-prop')).eqls(1);
    expect(group.getAttribute('data-testProp')).eqls(1);
    expect(group.getAttribute('dataTestProp')).eqls(1);
  });

  it('should retrieve data-* with dataset API', () => {
    const group = new Group();

    group.setAttribute('data-test-prop', 'test');
    expect(group.dataset.testProp).eqls('test');
    expect(group.dataset['test-prop']).eqls(null);
  });
});
