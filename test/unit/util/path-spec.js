const expect = require('chai').expect;
const Util = require('../../../src/util');
const PathUtil = require('../../../src/util/path');

describe('PathUtil', () => {
  it('fill L with C', () => {
    const path1 = [[ 'M', 245.7373046875, 242.89436666666668 ], [ 'L', 611.5791015625, 35.262968333333305 ]];
    const path2 = [
      [ 'M', 115.26450892857142, 225.14576114285714 ],
      [ 'C', 115.26450892857142, 225.14576114285714, 178.7633443159541, 245.64869959397348, 219.76227678571428, 242.25132142857143 ],
      [ 'C', 262.3615586016684, 238.72133025111634, 290.04645452446687, 233.03905902988083, 324.2600446428571, 207.8273377857143 ],
      [ 'C', 373.64466881018114, 171.43620274416654, 382.1815853644091, 130.67553707530774, 428.7578125, 88.2441807142857 ],
      [ 'C', 465.77979965012344, 54.51682178959344, 502.6525532983182, 11.5, 533.2555803571429, 17.430549571428543 ],
      [ 'C', 586.2507675840325, 48.159742424458955, 583.3566828420871, 173.35341915199137, 637.7533482142858, 209.42998 ],
      [ 'C', 666.9548971278014, 228.79681892341995, 742.2511160714286, 156.03904899999998, 742.2511160714286, 156.03904899999998 ]
    ];
    const path = PathUtil.fillPath(path1, path2);
    expect(path.length === path2.length);
    expect(path[path.length - 1][0] !== path[path.length - 2][0]);
    const diffPath = PathUtil.fillPathByDiff(path1, path2);
    expect(diffPath.length === path2.length);
    expect(diffPath[diffPath.length - 1][0] === diffPath[diffPath.length - 2][0]);
    const formatPath = PathUtil.formatPath(diffPath, path2);
    Util.each(formatPath, (segment, i) => {
      expect(segment.length === path2[i].length);
      expect(segment[0] === path2[i][0]);
    });
  });
  it('fill path with different lengths ', () => {
    const path1 = [
      [ 'M', 80, 135.6 ],
      [ 'C', 80, 135.6, 233.71744841306096, 117.55773869562708, 336.57957778110494, 115.2 ],
      [ 'C', 589.717448413061, 109.39773869562708, 970, 115.2, 970, 115.2 ]
    ];
    const path2 = [
      [ 'M', 80, 135.6 ],
      [ 'C', 80, 135.6, 213.70521055386126, 117.55942492628782, 303.2827361563518, 115.2 ],
      [ 'C', 523.5063831922978, 109.39942492628782, 634.2784277667965, 110.70776106379513, 854.5029315960912, 115.2 ],
      [ 'C', 900.9653333042558, 116.14776106379514, 970, 128.8, 970, 128.8 ]
    ];
    const path = PathUtil.fillPath(path1, path2);
    expect(path.length === path2.length);
    const diffPath = PathUtil.fillPathByDiff(path1, path2);
    expect(diffPath.length === path2.length);
    const formatPath = PathUtil.formatPath(diffPath, path2);
    Util.each(formatPath, (segment, i) => {
      expect(segment.length === path2[i].length);
      expect(segment[0] === path2[i][0]);
    });
  });
  it('fill path with z', () => {
    const path1 = [
      [ 'M', 525, 149 ],
      [ 'L', 513.2566650775772, 124.17080400088828 ],
      [ 'A', 27.466250000000002, 27.466250000000002, 0, 0, 1, 516.5979910031243, 122.85040853323096 ],
      [ 'L', 525, 149 ], [ 'z' ]];
    const path2 = [
      [ 'M', 949.1406250000001, 278 ],
      [ 'L', 949.1406250000001, 223.0675 ],
      [ 'L', 958.4114583333335, 223.0675 ],
      [ 'L', 958.4114583333335, 278 ],
      [ 'L', 949.1406250000001, 278 ], [ 'z' ]];
    const path = PathUtil.fillPath(path1, path2);
    expect(path.length === path2.length);
    expect(path[path.length - 2][0] !== 'z');
    const diffPath = PathUtil.fillPathByDiff(path1, path2);
    expect(diffPath.length === path2.length);
    expect(diffPath[diffPath.length - 2] !== 'z');
    const formatPath = PathUtil.formatPath(diffPath, path2);
    Util.each(formatPath, (segment, i) => {
      expect(segment.length === path2[i].length);
      expect(segment[0] === path2[i][0]);
    });
  });
  it('format A to L', () => {
    const path1 = [
      [ 'M', 525, 149 ],
      [ 'L', 513.2566650775772, 124.17080400088828 ],
      [ 'A', 27.466250000000002, 27.466250000000002, 0, 0, 1, 516.5979910031243, 122.85040853323096 ],
      [ 'L', 525, 149 ]];
    const path2 = [
      [ 'M', 949.1406250000001, 278 ],
      [ 'L', 949.1406250000001, 223.0675 ],
      [ 'L', 958.4114583333335, 223.0675 ],
      [ 'L', 958.4114583333335, 278 ]];
    const path = PathUtil.formatPath(path1, path2);
    Util.each(path, (segment, i) => {
      expect(segment.length === path2[i].length);
      expect(segment[0] === path2[i][0]);
    });
  });
  it('format A to C', () => {
    const path1 = [
      [ 'M', 525, 149 ],
      [ 'L', 513.2566650775772, 124.17080400088828 ],
      [ 'A', 27.466250000000002, 27.466250000000002, 0, 0, 1, 516.5979910031243, 122.85040853323096 ],
      [ 'L', 525, 149 ]];
    const path2 = [
      [ 'M', 80, 135.6 ],
      [ 'C', 80, 135.6, 213.70521055386126, 117.55942492628782, 303.2827361563518, 115.2 ],
      [ 'C', 523.5063831922978, 109.39942492628782, 634.2784277667965, 110.70776106379513, 854.5029315960912, 115.2 ],
      [ 'L', 958.4114583333335, 278 ]];
    const path = PathUtil.formatPath(path1, path2);
    Util.each(path, (segment, i) => {
      expect(segment.length === path2[i].length);
      expect(segment[0] === path2[i][0]);
    });
  });
});
