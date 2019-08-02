import Shape from './base';
import Circle from './circle';
import Rect from './rect';
import Path from './path';

Shape['Circle'] = Circle;
Shape['Rect'] = Rect;
Shape['Path'] = Path;

export default Shape;
