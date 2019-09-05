import Shape from './base';
import Circle from './circle';
import Dom from './dom';
import Ellipse from './ellipse';
import Image from './image';
import Line from './line';
import Marker from './marker';
import Path from './path';
import Polygon from './polygon';
import Polyline from './polyline';
import Rect from './rect';
import Text from './text';

Shape['Circle'] = Circle;
Shape['Dom'] = Dom;
Shape['Ellipse'] = Ellipse;
Shape['Image'] = Image;
Shape['Line'] = Line;
Shape['Marker'] = Marker;
Shape['Path'] = Path;
Shape['Polygon'] = Polygon;
Shape['Polyline'] = Polyline;
Shape['Rect'] = Rect;
Shape['Text'] = Text;

export default Shape;
