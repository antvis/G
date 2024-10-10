import {
  Cursor,
  DisplayObject,
  FederatedEvent,
  ParsedPolygonStyleProps,
  Polygon,
  Circle,
  CustomEvent,
  rad2deg,
} from '@antv/g-lite';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { SelectableEvent } from '../constants/enum';
import { AbstractSelectable } from './AbstractSelectable';
import { getABC, getFootOfPerpendicular, lineIntersect } from '../utils/drawer';

interface Control {
  x: number;
  y: number;
}

const scaleMap = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne', 'e'];
// const skewMap = ['ns', 'nesw', 'ew', 'nwse'];
const controls: Control[] = [
  {
    x: -0.5,
    y: -0.5,
  },
  {
    x: 0.5,
    y: -0.5,
  },
  {
    x: 0.5,
    y: 0.5,
  },
  {
    x: -0.5,
    y: 0.5,
  },
];

export class SelectableRectPolygon extends AbstractSelectable<Polygon> {
  private tlAnchor: Circle;
  private trAnchor: Circle;
  private blAnchor: Circle;
  private brAnchor: Circle;

  init() {
    const {
      anchorFill,
      anchorStroke,
      anchorFillOpacity,
      anchorStrokeOpacity,
      anchorSize,
      anchorStrokeWidth,
      selectionFill,
      selectionFillOpacity,
      selectionStroke,
      selectionStrokeOpacity,
      selectionStrokeWidth,
      selectionLineDash,
      target,
    } = this.style;

    const { points: parsedPoints } =
      target.parsedStyle as ParsedPolygonStyleProps;
    const { points } = parsedPoints;

    this.mask = new Polygon({
      style: {
        points,
        draggable: target.style.maskDraggable !== false,
        cursor: 'move',
        isSizeAttenuation: true,
        fill: selectionFill,
        stroke: selectionStroke,
        fillOpacity: selectionFillOpacity,
        strokeOpacity: selectionStrokeOpacity,
        lineWidth: selectionStrokeWidth,
        lineDash: selectionLineDash,
      },
    });
    // @ts-ignore
    this.mask.style.originalPoints = points;
    this.appendChild(this.mask);

    this.tlAnchor = new Circle({
      style: {
        r: anchorSize,
        cursor: 'nwse-resize',
        draggable: true,
        isSizeAttenuation: true,
        lineWidth: anchorStrokeWidth,
      },
    });

    this.trAnchor = this.tlAnchor.cloneNode();
    // TODO: adjust orient according to rotation
    this.trAnchor.style.cursor = 'nesw-resize';

    this.brAnchor = this.tlAnchor.cloneNode();
    this.brAnchor.style.cursor = 'nwse-resize';

    this.blAnchor = this.tlAnchor.cloneNode();
    this.blAnchor.style.cursor = 'nesw-resize';

    this.anchors = [this.tlAnchor, this.trAnchor, this.brAnchor, this.blAnchor];

    this.mask.appendChild(this.tlAnchor);
    this.mask.appendChild(this.trAnchor);
    this.mask.appendChild(this.brAnchor);
    this.mask.appendChild(this.blAnchor);

    // set anchors' style
    this.anchors.forEach((anchor, i) => {
      if (target.style.anchorsVisibility === 'hidden') {
        anchor.style.visibility = 'hidden';
      }

      anchor.style.stroke = anchorStroke;
      anchor.style.fill = anchorFill;
      anchor.style.fillOpacity = anchorFillOpacity;
      anchor.style.strokeOpacity = anchorStrokeOpacity;
      anchor.style.cursor = this.scaleCursorStyleHandler(
        controls[i],
        target,
      ) as Cursor;
    });

    if (this.plugin.annotationPluginOptions.enableRotateAnchor) {
      const {
        anchorFill,
        anchorStroke,
        anchorFillOpacity,
        anchorStrokeOpacity,
        anchorSize,
        anchorStrokeWidth,
        target,
      } = this.style;

      this.rotateAnchor = new Circle({
        style: {
          r: anchorSize,
          stroke: anchorStroke,
          fill: anchorFill,
          fillOpacity: anchorFillOpacity,
          strokeOpacity: anchorStrokeOpacity,
          cursor: 'move',
          draggable: true,
          visibility:
            target.style.anchorsVisibility === 'hidden' ? 'hidden' : 'visible',
          isSizeAttenuation: true,
          lineWidth: anchorStrokeWidth,
        },
      });
      this.mask.appendChild(this.rotateAnchor);

      if (!this.plugin.rotateAnchorVisible) {
        this.rotateAnchor.style.visibility = 'hidden';
      }
    }

    this.repositionAnchors();

    this.bindEventListeners();
  }

  private repositionAnchors() {
    const { rotateAnchorDistance } = this.style;
    const { points } = this.mask.parsedStyle;
    points.points.forEach((point, i) => {
      const anchor = this.anchors[i];
      anchor.style.cx = point[0];
      anchor.style.cy = point[1];
    });

    // mid point of upper edge
    const midPoint = [
      (points.points[0][0] + points.points[1][0]) / 2,
      (points.points[0][1] + points.points[1][1]) / 2,
    ];
    const handleVec = vec2.normalize(
      vec2.create(),
      vec2.sub(
        vec2.create(),
        points.points[0] as [number, number],
        points.points[3] as [number, number],
      ),
    );
    this.rotateAnchor.style.cx =
      handleVec[0] * rotateAnchorDistance + midPoint[0];
    this.rotateAnchor.style.cy =
      handleVec[1] * rotateAnchorDistance + midPoint[1];
  }

  deleteSelectedAnchors(): void {}

  destroy(): void {}

  moveMask(dx: number, dy: number) {
    // @ts-ignore
    this.mask.style.points = [...this.mask.style.pointsStartDragging].map(
      ([x, y]) => [x + dx, y + dy],
    );

    // re-position anchors in canvas coordinates
    this.repositionAnchors();
  }

  triggerMovingEvent(dx: number, dy: number) {
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVING, {
        movingX: dx,
        movingY: dy,
        dx,
        dy,
      }),
    );
  }

  triggerMovedEvent() {
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVED, {
        polygon: {
          points: this.mask.style.points,
        },
      }),
    );
  }

  /**
   * Support 2 kinds of interactions:
   * * Drag with pointer device.
   * * ArrowKey with keyboard.
   */
  private bindEventListeners() {
    const { target: targetObject } = this.style;

    // listen to drag'n'drop events
    let shiftX = 0;
    let shiftY = 0;
    const moveAt = (canvasX: number, canvasY: number) => {
      // account for multi-selection
      this.plugin.selected.forEach((selected) => {
        const selectable = this.plugin.getOrCreateSelectableUI(selected);
        selectable.triggerMovingEvent(canvasX - shiftX, canvasY - shiftY);
      });
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        shiftX = e.canvasX;
        shiftY = e.canvasY;
        // @ts-ignore
        this.mask.style.pointsStartDragging = this.mask.style.points;

        moveAt(e.canvasX, e.canvasY);
      }
    });

    const tmpMat = mat4.create();
    const tmpQuat = quat.create();
    const tmpVec = vec3.create();
    const translateVec3 = vec3.create();
    const scalingVec3 = vec3.fromValues(1, 1, 1);
    this.addEventListener('drag', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      // event in canvas coordinates
      const { canvasX, canvasY } = e;
      // position in canvas coordinates
      const [tl, tr, br, bl] = this.mask.style.points.map(([x, y]) => ({
        x,
        y,
      }));

      if (target === this.mask) {
        moveAt(canvasX, canvasY);
      } else if (
        target === this.tlAnchor ||
        target === this.trAnchor ||
        target === this.blAnchor ||
        target === this.brAnchor
      ) {
        if (target === this.tlAnchor) {
          tl.x = canvasX;
          tl.y = canvasY;
          {
            const { A, B, C } = getABC(br, tr);
            const { x, y } = getFootOfPerpendicular(tl, A, B, C);
            tr.x = x;
            tr.y = y;
          }
          {
            const { A, B, C } = getABC(br, bl);
            const { x, y } = getFootOfPerpendicular(tl, A, B, C);
            bl.x = x;
            bl.y = y;
          }
        } else if (target === this.trAnchor) {
          tr.x = canvasX;
          tr.y = canvasY;
          {
            const { A, B, C } = getABC(bl, tl);
            const { x, y } = getFootOfPerpendicular(tr, A, B, C);
            tl.x = x;
            tl.y = y;
          }
          {
            const { A, B, C } = getABC(br, bl);
            const { x, y } = getFootOfPerpendicular(tr, A, B, C);
            br.x = x;
            br.y = y;
          }
        } else if (target === this.blAnchor) {
          bl.x = canvasX;
          bl.y = canvasY;
          {
            const { A, B, C } = getABC(tr, tl);
            const { x, y } = getFootOfPerpendicular(bl, A, B, C);
            tl.x = x;
            tl.y = y;
          }
          {
            const { A, B, C } = getABC(br, tr);
            const { x, y } = getFootOfPerpendicular(bl, A, B, C);
            br.x = x;
            br.y = y;
          }
        } else if (target === this.brAnchor) {
          br.x = canvasX;
          br.y = canvasY;
          {
            const { A, B, C } = getABC(tl, tr);
            const { x, y } = getFootOfPerpendicular(br, A, B, C);
            tr.x = x;
            tr.y = y;
          }
          {
            const { A, B, C } = getABC(tl, bl);
            const { x, y } = getFootOfPerpendicular(br, A, B, C);
            bl.x = x;
            bl.y = y;
          }
        }

        this.mask.style.points = [
          [tl.x, tl.y],
          [tr.x, tr.y],
          [br.x, br.y],
          [bl.x, bl.y],
        ];
        this.repositionAnchors();
      } else if (target === this.rotateAnchor) {
        const { x: ox, y: oy } = lineIntersect(tl, br, tr, bl);

        const { cx: rx, cy: ry } = this.rotateAnchor.parsedStyle;
        const v1 = [rx - ox, ry - oy];
        const v2 = [canvasX - ox, canvasY - oy];
        // @see https://www.mathworks.com/matlabcentral/answers/180131-how-can-i-find-the-angle-between-two-vectors-including-directional-information
        const angle = rad2deg(
          Math.atan2(
            v1[0] * v2[1] - v1[1] * v2[0],
            v1[0] * v2[0] + v1[1] * v2[1],
          ),
        );

        const m = mat4.fromRotationTranslationScaleOrigin(
          tmpMat,
          quat.fromEuler(tmpQuat, 0, 0, angle),
          translateVec3,
          scalingVec3,
          [ox, oy, 0],
        );

        [tl, tr, br, bl].forEach((corner) => {
          vec3.transformMat4(tmpVec, vec3.fromValues(corner.x, corner.y, 0), m);
          corner.x = tmpVec[0];
          corner.y = tmpVec[1];
        });

        this.mask.style.points = [
          [tl.x, tl.y],
          [tr.x, tr.y],
          [br.x, br.y],
          [bl.x, bl.y],
        ];
        this.repositionAnchors();
      }
    });

    this.addEventListener('dragend', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      if (target === this.mask) {
        // account for multi-selection
        this.plugin.selected.forEach((selected) => {
          const selectable = this.plugin.getOrCreateSelectableUI(selected);
          selectable.triggerMovedEvent();
        });
      } else if (
        target === this.tlAnchor ||
        target === this.trAnchor ||
        target === this.blAnchor ||
        target === this.brAnchor ||
        target === this.rotateAnchor
      ) {
        targetObject.dispatchEvent(
          new CustomEvent(SelectableEvent.MODIFIED, {
            polygon: {
              points: this.mask.style.points,
            },
          }),
        );
      }
    });
  }

  private findCornerQuadrant(object: DisplayObject, control: Control) {
    const angle = object.getEulerAngles();
    const cornerAngle = angle + rad2deg(Math.atan2(control.y, control.x)) + 360;
    return Math.round((cornerAngle % 360) / 45);
  }

  /**
   * TODO: Toggle with plugin option, object's style and keypress
   * e.g. with shift keypress
   */
  private scaleIsProportional(object: DisplayObject) {
    return false;
  }

  private scalingIsForbidden(
    object: DisplayObject,
    by: string,
    scaleProportionally: boolean,
  ) {
    const lockX = object.style.lockScalingX;
    const lockY = object.style.lockScalingY;
    if (lockX && lockY) {
      return true;
    }
    if (!by && (lockX || lockY) && scaleProportionally) {
      return true;
    }
    if (lockX && by === 'x') {
      return true;
    }
    if (lockY && by === 'y') {
      return true;
    }
    return false;
  }

  private scaleCursorStyleHandler(control: Control, object: DisplayObject) {
    const notAllowed = 'not-allowed';
    const scaleProportionally = this.scaleIsProportional(object);
    let by = '';
    if (control.x !== 0 && control.y === 0) {
      by = 'x';
    } else if (control.x === 0 && control.y !== 0) {
      by = 'y';
    }
    if (this.scalingIsForbidden(object, by, scaleProportionally)) {
      return notAllowed;
    }
    const n = this.findCornerQuadrant(object, control);
    return `${scaleMap[n]}-resize`;
  }
}
