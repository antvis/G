import type { TestSuite } from '../../../../base';
import { RectCase } from './rect';
import { TextCase } from './text';
import { CircleCase } from './circle';
import { EllipseCase } from './ellipse';
import { LineCase } from './line';
import { PolylineCase } from './polyline';
import { PolygonCase } from './polygon';
import { ImageCase } from './image';
import { PathCase } from './path';
import type { Canvas } from '@antv/g';

export const basicShapesTestSuite: TestSuite<Canvas> = {
  name: 'basic-shapes',
  cases: [
    new RectCase(),
    new TextCase(),
    new CircleCase(),
    new EllipseCase(),
    new LineCase(),
    new PolylineCase(),
    new PolygonCase(),
    new ImageCase(),
    new PathCase(),
  ],
};
