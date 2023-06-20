import { AbsoluteArray } from '@antv/util';
import { Rectangle } from '../shapes';

export const EMPTY_PARSED_PATH = {
  absolutePath: [] as unknown as AbsoluteArray,
  hasArc: false,
  segments: [],
  polygons: [],
  polylines: [],
  curve: null,
  totalLength: 0,
  rect: new Rectangle(0, 0, 0, 0),
};
