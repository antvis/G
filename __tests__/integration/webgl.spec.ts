import * as _2d from '../demos/2d';
// import * as d3 from '../demos/d3';
import { generateCanvasTestCase } from './generator';

describe('WebGL Snapshot', () => {
  generateCanvasTestCase('webgl', '2d', _2d);
  //   generateCanvasTestCase('webgl', 'd3', d3);
});
