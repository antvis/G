// @see https://github.com/antvis/G/issues/1382
// eslint-disable-next-line import/extensions
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import { GCanvasElement } from './GCanvas';
import { registerGWebComponent } from './register';
import {
  CircleShape,
  EllipseShape,
  GroupShape,
  HTMLShape,
  ImageShape,
  LineShape,
  PathShape,
  PolylineShape,
  RectShape,
  TextShape,
} from './shape';

registerGWebComponent('canvas', GCanvasElement);
registerGWebComponent('rect', RectShape);
registerGWebComponent('circle', CircleShape);
registerGWebComponent('text', TextShape);
registerGWebComponent('path', PathShape);
registerGWebComponent('ellipse', EllipseShape);
registerGWebComponent('image', ImageShape);
registerGWebComponent('line', LineShape);
registerGWebComponent('polyline', PolylineShape);
registerGWebComponent('html', HTMLShape);
registerGWebComponent('group', GroupShape);

export * from './GCanvas';
export * from './GElement';
