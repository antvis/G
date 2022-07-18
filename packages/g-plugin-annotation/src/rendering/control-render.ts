import { Circle } from '@antv/g';
export interface ControlOptions {
  controlId: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  onDrag?: (x: number, y: number) => void;
}
export const renderControl = (options: ControlOptions) => {
  const { x, y, size = 5, color = 'blue', controlId } = options;
  const control = new Circle({
    style: {
      cx: x,
      cy: y,
      r: size,
      stroke: color,
      lineWidth: 1,
      cursor: 'pointer',
    },
    className: controlId,
    id: controlId,
  });
  control.addEventListener('click', () => {});
  return control;
};
