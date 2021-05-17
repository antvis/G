import bbox from './bbox';
import { setMiniCanvas } from '../shape/image';

export default (context: CanvasRenderingContext2D, canvas: any) => {
  setMiniCanvas(canvas);
  bbox(context);
};
