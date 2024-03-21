import type * as G from '@antv/g';
import type { DisplayObject, PathStyleProps } from '@antv/g';
import { isBoolean } from '@antv/util';
import { vec3 } from 'gl-matrix';
import React, { Component } from 'react';
import { Group, Path } from '../host-elements';

type ArrowHead = boolean | React.ReactNode;
export interface ArrowStyleProps extends PathStyleProps {
  path: string;
  startHead?: ArrowHead;
  endHead?: ArrowHead;
}

const DEFAULT_ARROW_SIZE = 16;
export class Arrow extends Component<ArrowStyleProps, any> {
  startRef: React.MutableRefObject<DisplayObject | null>;
  endRef: React.MutableRefObject<DisplayObject | null>;
  bodyRef: React.MutableRefObject<G.Path | null>;

  constructor(props: ArrowStyleProps) {
    super(props);

    this.startRef = React.createRef();
    this.endRef = React.createRef();
    this.bodyRef = React.createRef();
  }

  getArrowHead(head: ArrowHead, isStart: boolean) {
    if (isBoolean(head)) {
      return this.getDefaultArrowHead();
    } else {
      return isStart ? this.props.startHead : this.props.endHead;
    }
  }

  setHeadTransform() {
    const { startHead, endHead } = this.props;

    if (startHead)
      this.transformArrowHead(this.startRef.current as DisplayObject, true);
    if (endHead)
      this.transformArrowHead(this.endRef.current as DisplayObject, false);
  }

  componentDidMount() {
    this.setHeadTransform();
  }

  componentDidUpdate() {
    this.setHeadTransform();
  }

  render() {
    const { startHead, endHead, ...others } = this.props;

    return (
      <Group>
        <Path {...others} ref={this.bodyRef} />
        {startHead && (
          <Group ref={this.startRef}>
            {this.getArrowHead(startHead, true)}
          </Group>
        )}
        {endHead && (
          <Group ref={this.endRef}>{this.getArrowHead(endHead, false)}</Group>
        )}
      </Group>
    );
  }

  getCenter() {
    const points = (this.bodyRef.current as G.Path).getPoint(0.5);
    return points;
  }

  // transform arrow head to match line tangent
  private transformArrowHead(head: DisplayObject, isStart: boolean) {
    const [p1, p2] = this.getTangent(this.bodyRef.current as G.Path, isStart);
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    const x = x1 - x2;
    const y = y1 - y2;
    const rad = Math.atan2(y, x) + Math.PI;
    const position = vec3.fromValues(x2, y2, 0);

    head.setLocalPosition(position);
    head.setLocalEulerAngles((rad * 180) / Math.PI);
  }

  private getTangent(path: G.Path, isStart: boolean): number[][] {
    return isStart ? path.getStartTangent() : path.getEndTangent();
  }

  private getDefaultArrowHead() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { startHead, endHead, ...others } = this.props;
    const { sin, cos, PI } = Math;
    return (
      <Path
        {...others}
        lineDash={undefined}
        fill={this.props.stroke}
        d={`M-${DEFAULT_ARROW_SIZE * cos(PI / 6)},${
          DEFAULT_ARROW_SIZE * sin(PI / 6)
        } L0,0 L-${DEFAULT_ARROW_SIZE * cos(PI / 6)},-${
          DEFAULT_ARROW_SIZE * sin(PI / 6)
        } Z`}
      />
    );
  }
}
