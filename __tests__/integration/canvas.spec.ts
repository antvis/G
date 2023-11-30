import * as _2d from '../demos/2d';
import * as d3 from '../demos/d3';
import { generateCanvasTestCase } from './canvas';

describe('Canvas Snapshot', () => {
  generateCanvasTestCase('2d', _2d);
  // generateCanvasTestCase('d3', d3);
});
