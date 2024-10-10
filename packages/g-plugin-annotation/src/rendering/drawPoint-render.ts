import { Circle, CircleStyleProps, definedProps } from '@antv/g-lite';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import {
  ACTIVE_DRAWPOINT_STYLE,
  NORMAL_DRAWPOINT_STYLE,
} from '../constants/style';
import type { DrawerState } from '../interface/drawer';

export const renderDrawPoints = (
  context: AnnotationPlugin,
  anno: DrawerState,
) => {
  const points = anno.path.slice(0, anno.path.length - 1);
  const { length } = points;
  const zoom = context.canvas.getCamera().getZoom();

  const {
    polylineVertexFill,
    polylineVertexFillOpacity,
    polylineVertexSize,
    polylineVertexStroke,
    polylineVertexStrokeOpacity,
    polylineVertexStrokeWidth,
    polylineActiveVertexFill,
    polylineActiveVertexFillOpacity,
    polylineActiveVertexSize,
    polylineActiveVertexStroke,
    polylineActiveVertexStrokeOpacity,
    polylineActiveVertexStrokeWidth,
  } = context.annotationPluginOptions.drawerStyle;

  // hide all control points first
  for (let i = 0; i < context.polylineControlPoints.length; i++) {
    context.polylineControlPoints[i].style.visibility = 'hidden';
  }

  points.forEach((point, index) => {
    const styles =
      index === length - 1 ? ACTIVE_DRAWPOINT_STYLE : NORMAL_DRAWPOINT_STYLE;
    const overrideStyles =
      index === length - 1
        ? {
            fill: polylineActiveVertexFill,
            fillOpacity: polylineActiveVertexFillOpacity,
            r: polylineActiveVertexSize as number,
            stroke: polylineActiveVertexStroke,
            strokeOpacity: polylineActiveVertexStrokeOpacity,
            lineWidth: polylineActiveVertexStrokeWidth,
          }
        : {
            fill: polylineVertexFill,
            fillOpacity: polylineVertexFillOpacity,
            r: polylineVertexSize as number,
            stroke: polylineVertexStroke,
            strokeOpacity: polylineVertexStrokeOpacity,
            lineWidth: polylineVertexStrokeWidth,
          };

    let circle = context.polylineControlPoints[index];
    if (!circle) {
      circle = new Circle({
        style: {
          cx: 0,
          cy: 0,
          r: 0,
          cursor: 'pointer',
          isSizeAttenuation: true,
          ...styles,
          ...definedProps(overrideStyles),
        },
        className: anno.id,
        id: `${anno.id}-circle-${index}`,
      });

      context.canvas?.appendChild(circle);

      context.polylineControlPoints[index] = circle;

      // todo:  修改不生效
      // circle.addEventListener('mouseover', () => {
      //   circle.attr({ ...circle.style, ...HOVER_DRAWPOINT_STYLE, r: 10 });
      // });

      // circle.addEventListener('mouseout', () => {
      //   circle.style = { ...circle.style, ...HOVER_DRAWPOINT_STYLE };
      // });
    }

    const circleStyle: CircleStyleProps = {
      cx: point.x,
      cy: point.y,
      visibility: 'visible',
      ...styles,
      ...definedProps(overrideStyles),
    };

    // @ts-ignore
    circleStyle.r /= zoom;
    // @ts-ignore
    circleStyle.lineWidth /= zoom;

    circle.attr(circleStyle);
  });
};
