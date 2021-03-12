import { expect } from 'chai';
import { topologicalSort } from '../topological-sort';

describe('Topological Sort', () => {
  it('should sort correctly', async () => {
    expect(
      topologicalSort({
        3: [1, 2, 4, 5],
        2: [8, 9],
        1: [6, 7],
      })
    ).to.eqls([3, 5, 4, 2, 9, 8, 1, 7, 6]);

    // expect(topologicalSort({
    //   3: [1, 2, 4, 5],
    //   2: [8, 9],
    //   1: [6, 7],
    // }, {
    //   6: 99,
    //   7: 100,
    // })).to.eqls([ 3, 5, 4, 2, 9, 8, 1, 6, 7 ]);
  });
});
