import { CustomElement, Geometry, Line, Path, ShapeCfg } from '@antv/g';

export interface ArrowConfig extends ShapeCfg {
  attrs: Partial<{
    stroke: string;
    opacity: number;
    strokeOpacity: number;
    lineWidth: number;
    start: boolean;
    end: boolean;
  }>;
}

export class Arrow extends CustomElement {
  static tag = 'arrow';
  private line: Line;
  private arrow: Path;

  constructor(config: ArrowConfig) {
    super({
      ...config,
      type: Arrow.tag,
    });

    // main line
    this.line = new Line({
      id: `${this.getEntity().getName()}-line`,
      attrs: config.attrs,
    });
    this.appendChild(this.line);

    const { x1, x2, y1, y2, stroke, lineWidth } = this.attributes;
    const x = x1 - x2;
    const y = y1 - y2;
    const { sin, cos, atan2, PI } = Math;
    const rad = atan2(y, x);
    this.arrow = new Path({
      type: 'path',
      attrs: {
        // 默认箭头的边长为 10，夹角为 60 度
        path: `M${10 * cos(PI / 6)},${10 * sin(PI / 6)} L0,0 L${10 * cos(PI / 6)},-${10 * sin(PI / 6)}`,
        stroke,
        lineWidth,
      },
    });

    // this.arrow.setOrigin(0, 0);
    this.arrow.setLocalPosition(x2, y2);
    this.arrow.rotateLocal((rad * 180) / Math.PI);
    this.appendChild(this.arrow);
  }

  attributeChangedCallback(name: string, value: any) {
    if (name === 'x1') {
      this.line.setAttribute('x1', value);
    } else if (name === 'opacity' || name === 'strokeOpacity' || name === 'stroke' || name === 'lineWidth') {
      [this.line, this.arrow].forEach((shape) => {
        shape.setAttribute(name, value);
      });
    }
  }
}
