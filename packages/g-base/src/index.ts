/**
 * @fileoverview G 的基础接口定义和所有的抽象类
 * @author dxq613@gmail.com
 */

import * as PathUtil from './util/path';

export * from './types';
export * from './interfaces';
export { default as Event } from './event/graph-event';
export { default as Base } from './abstract/base';
export { default as AbstractCanvas } from './abstract/canvas';
export { default as AbstractGroup } from './abstract/group';
export { default as AbstractShape } from './abstract/shape';
export { PathUtil };

export { getBBoxMethod } from './bbox';
export { getTextHeight, assembleFont } from './util/text';
export { isAllowCapture } from './util/util';
export { multiplyVec2, invert } from './util/matrix';
export { getOffScreenContext } from './util/offscreen';

export const version = '0.5.6';
