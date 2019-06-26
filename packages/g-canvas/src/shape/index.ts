
import Shape from './base';
import Circle from './circle';
import Rect from './rect';

Shape['Circle'] = Circle;
Shape['Rect'] = Rect;

export default Shape;
