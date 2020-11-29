import { expect } from 'chai';

import { version } from '../../src/index';
import { version as pkgVersion } from '../../package.json';

describe('version in the code', () => {
  it('should be equal to the version in package.json', () => {
    expect(version).eql(pkgVersion);
  });
});
