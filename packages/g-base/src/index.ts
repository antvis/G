/**
 * @fileoverview G 的基础接口定义和所有的抽象类
 * @author dxq613@gmail.com
 */

import * as PathUtil from './util/path';
const pkg = require('../package.json');

export const version = pkg.version;

export * from './interfaces';

export { default as Event } from './event/graph-event';
export { default as Base } from './abstract/base';
export { default as AbstractCanvas } from './abstract/canvas';
export { default as AbstractGroup } from './abstract/group';
export { default as AbstractShape } from './abstract/shape';
export { PathUtil };
