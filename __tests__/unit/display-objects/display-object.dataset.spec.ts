import { Group, runtime } from '../../../packages/g/src';

describe('DisplayObject dataset API', () => {
  it('should setAttribute data-* with dataset API', () => {
    runtime.enableDataset = true;
    runtime.enableAttributeDashCased = true;

    const group = new Group();

    group.dataset.testProp = 1;
    expect(group.dataset.testProp).toBe(1);
    expect(group.getAttribute('data-test-prop')).toBe(1);
    expect(group.getAttribute('data-testProp')).toBe(1);
    expect(group.getAttribute('dataTestProp')).toBe(1);

    runtime.enableAttributeDashCased = false;
  });

  it('should retrieve data-* with dataset API', () => {
    const group = new Group();

    group.setAttribute('data-test-prop', 'test');
    expect(group.dataset.testProp).toBe('test');
    expect(group.dataset['test-prop']).toBeUndefined();
  });
});
