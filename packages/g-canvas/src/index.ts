import * as Shape from './shape';
const pkg = require('../package.json');

export const version = pkg.version;
export { BBox } from '@antv/g-base';
export { Event } from '@antv/g-base';
export { default as Canvas } from './canvas';
export { default as Group } from './group';
export { Shape };
