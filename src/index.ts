import BBox from './core/bbox';
import Canvas from './canvas';
import Element from './core/element';
import Event from './event';
import Group from './core/group';
import PathSegment from './shapes/util/path-segment';
import Shape from './core/shape';
import * as PathUtil from './util/path';
import * as Shapes from './shapes';

export const version = '3.4.1';

export * from './shapes';
export * from './interface';

export { BBox, Canvas, Element, Event, Group, PathSegment, PathUtil, Shape, Shapes };
