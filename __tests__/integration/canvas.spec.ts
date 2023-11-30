import * as _2d from '../demos/2d';
// import * as d3 from '../demos/d3';
import { generateCanvasTestCase } from './generator';

describe('Canvas Snapshot', () => {
  generateCanvasTestCase('canvas', '2d', _2d);
  // generateCanvasTestCase('canvas', 'd3', d3);
});
