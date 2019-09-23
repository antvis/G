/**
 * @fileoverview G 的基础接口定义和所有的抽象类
 * @author dxq613@gmail.com
 */

import * as Interfaces from './interfaces';
import * as Types from './types';

const pkg = require('../package.json');
const version = pkg.version;

export { Interfaces, Types, version };
export { default as BBox } from './bbox';
export { default as AbstractCanvas } from './abstract/canvas';
export { default as AbstractGroup } from './abstract/group';
export { default as AbstractShape } from './abstract/shape';
export { default as Base } from './abstract/base';
