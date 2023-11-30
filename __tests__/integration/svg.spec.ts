import * as _2d from '../demos/2d';
// import * as d3 from '../demos/d3';
import { generateCanvasTestCase } from './generator';

describe('SVG Snapshot', () => {
  generateCanvasTestCase('svg', '2d', _2d);
  //   generateCanvasTestCase('svg', 'd3', d3);
});
