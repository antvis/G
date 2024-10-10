import type { Cursor, DisplayObject, FederatedEvent } from '@antv/g-lite';
import { Circle, CustomEvent, rad2deg, Rect } from '@antv/g-lite';
import { vec3 } from 'gl-matrix';
import { SelectableEvent } from '../constants/enum';
import { AbstractSelectable } from './AbstractSelectable';

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

export class SelectableRect extends AbstractSelectable<Rect> {
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

    const { center, halfExtents } = target.getGeometryBounds();
    this.mask = new Rect({
      style: {
        x: center[0] - halfExtents[0],
        y: center[1] - halfExtents[1],
        width: halfExtents[0] * 2,
        height: halfExtents[1] * 2,
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
    const transform = target.getWorldTransform();
    this.setLocalTransform(transform);

    this.appendChild(this.mask);

    const tl = vec3.fromValues(
      center[0] - halfExtents[0],
      center[1] - halfExtents[1],
      0,
    );
    const tr = vec3.fromValues(
      center[0] + halfExtents[0],
      center[1] - halfExtents[1],
      0,
    );
    const br = vec3.fromValues(
      center[0] + halfExtents[0],
      center[1] + halfExtents[1],
      0,
    );
    const bl = vec3.fromValues(
      center[0] - halfExtents[0],
      center[1] + halfExtents[1],
      0,
    );

    vec3.transformMat4(tl, tl, transform);
    vec3.transformMat4(tr, tr, transform);
    vec3.transformMat4(br, br, transform);
    vec3.transformMat4(bl, bl, transform);

    this.tlAnchor = new Circle({
      style: {
        r: anchorSize,
        cursor: 'nwse-resize',
        draggable: true,
        isSizeAttenuation: true,
        stroke: anchorStroke,
        fill: anchorFill,
        fillOpacity: anchorFillOpacity,
        strokeOpacity: anchorStrokeOpacity,
        lineWidth: anchorStrokeWidth,
      },
    });
    this.tlAnchor.style.cx = tl[0];
    this.tlAnchor.style.cy = tl[1];

    this.trAnchor = this.tlAnchor.cloneNode();
    // TODO: adjust orient according to rotation
    this.trAnchor.style.cursor = 'nesw-resize';
    this.trAnchor.style.cx = tr[0];
    this.trAnchor.style.cy = tr[1];

    this.brAnchor = this.tlAnchor.cloneNode();
    this.brAnchor.style.cursor = 'nwse-resize';
    this.brAnchor.style.cx = br[0];
    this.brAnchor.style.cy = br[1];

    this.blAnchor = this.tlAnchor.cloneNode();
    this.blAnchor.style.cursor = 'nesw-resize';
    this.blAnchor.style.cx = bl[0];
    this.blAnchor.style.cy = bl[1];

    this.anchors = [this.tlAnchor, this.trAnchor, this.brAnchor, this.blAnchor];

    this.mask.appendChild(this.tlAnchor);
    this.mask.appendChild(this.trAnchor);
    this.mask.appendChild(this.brAnchor);
    this.mask.appendChild(this.blAnchor);

    // resize according to target
    this.mask.style.fill = selectionFill;
    this.mask.style.stroke = selectionStroke;
    this.mask.style.fillOpacity = selectionFillOpacity;
    this.mask.style.strokeOpacity = selectionStrokeOpacity;
    this.mask.style.lineWidth = selectionStrokeWidth;
    this.mask.style.lineDash = selectionLineDash;

    // set anchors' style
    this.anchors.forEach((anchor, i) => {
      if (target.style.anchorsVisibility === 'hidden') {
        anchor.style.visibility = 'hidden';
      }
      anchor.style.cursor = this.scaleCursorStyleHandler(
        controls[i],
        target,
      ) as Cursor;
    });

    this.bindEventListeners();
  }

  deleteSelectedAnchors(): void {}

  destroy(): void {}

  moveMask(dx: number, dy: number) {
    const maskX = this.mask.parsedStyle.x + dx;
    const maskY = this.mask.parsedStyle.y + dy;
    const maskWidth = Number(this.mask.style.width);
    const maskHeight = Number(this.mask.style.height);

    this.mask.style.x = maskX;
    this.mask.style.y = maskY;

    // re-position anchors
    this.tlAnchor.style.cx = maskX;
    this.tlAnchor.style.cy = maskY;
    this.trAnchor.style.cx = maskX + maskWidth;
    this.trAnchor.style.cy = maskY;
    this.blAnchor.style.cx = maskX;
    this.blAnchor.style.cy = maskY + maskHeight;
    this.brAnchor.style.cx = maskX + maskWidth;
    this.brAnchor.style.cy = maskY + maskHeight;
  }

  triggerMovingEvent(dx: number, dy: number) {
    const maskX = this.mask.parsedStyle.x;
    const maskY = this.mask.parsedStyle.y;
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVING, {
        movingX: maskX + dx,
        movingY: maskY + dy,
        dx,
        dy,
      }),
    );
  }

  triggerMovedEvent() {
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVED, {
        rect: {
          x: this.mask.parsedStyle.x,
          y: this.mask.parsedStyle.y,
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
      const { x, y } = this.mask.parsedStyle;
      const dx = canvasX - shiftX - x;
      const dy = canvasY - shiftY - y;

      // account for multi-selection
      this.plugin.selected.forEach((selected) => {
        const selectable = this.plugin.getOrCreateSelectableUI(selected);
        selectable.triggerMovingEvent(dx, dy);
      });
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        const { x, y } = this.mask.parsedStyle;
        shiftX = e.canvasX - x;
        shiftY = e.canvasY - y;

        moveAt(e.canvasX, e.canvasY);
      }
    });

    let maskX: number;
    let maskY: number;
    let maskWidth: number;
    let maskHeight: number;

    this.addEventListener('drag', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      // event in canvas coordinates
      const { canvasX, canvasY } = e;
      const originMaskWidth = Number(this.mask.style.width);
      const originMaskHeight = Number(this.mask.style.height);

      // position in canvas coordinates
      const ox = this.mask.parsedStyle.x;
      const oy = this.mask.parsedStyle.y;
      // const angles = this.getEulerAngles();

      if (target === this.mask) {
        moveAt(canvasX, canvasY);
      } else if (
        target === this.tlAnchor ||
        target === this.trAnchor ||
        target === this.blAnchor ||
        target === this.brAnchor
      ) {
        if (target === this.tlAnchor) {
          maskWidth = originMaskWidth - (canvasX - ox);
          maskHeight = originMaskHeight - (canvasY - oy);
          maskX = canvasX;
          maskY = canvasY;
        } else if (target === this.trAnchor) {
          maskWidth = canvasX - ox;
          maskHeight = originMaskHeight - (canvasY - oy);
          maskX = ox;
          maskY = canvasY;
        } else if (target === this.blAnchor) {
          maskWidth = originMaskWidth - (canvasX - ox);
          maskHeight = canvasY - oy;
          maskX = canvasX;
          maskY = oy;
        } else if (target === this.brAnchor) {
          // const height = distanceFromPointToLine({ x: ox, y: oy }, deg2rad(angles), {
          //   x: canvasX,
          //   y: canvasY,
          // });
          // const width = distanceFromPointToLine({ x: ox, y: oy }, deg2rad(90 - angles), {
          //   x: canvasX,
          //   y: canvasY,
          // });
          // maskWidth = width;
          // maskHeight = -height;
          maskWidth = canvasX - ox;
          maskHeight = canvasY - oy;
          maskX = ox;
          maskY = oy;
        }

        // resize mask
        this.mask.style.width = maskWidth;
        this.mask.style.height = maskHeight;
        this.mask.style.x = maskX;
        this.mask.style.y = maskY;

        // re-position anchors
        this.tlAnchor.style.cx = maskX;
        this.tlAnchor.style.cy = maskY;
        this.trAnchor.style.cx = maskX + maskWidth;
        this.trAnchor.style.cy = maskY;
        this.blAnchor.style.cx = maskX;
        this.blAnchor.style.cy = maskY + maskHeight;
        this.brAnchor.style.cx = maskX + maskWidth;
        this.brAnchor.style.cy = maskY + maskHeight;
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
        target === this.brAnchor
      ) {
        targetObject.dispatchEvent(
          new CustomEvent(SelectableEvent.MODIFIED, {
            rect: {
              x: maskX,
              y: maskY,
              width: maskWidth,
              height: maskHeight,
            },
          }),
        );
      }
    });
  }

  // private scaleObject(target: DisplayObject, canvasX: number, canvasY: number, options: any = {}) {
  //   const scaleProportionally = this.scaleIsProportional(target);
  //   const by = options.by;
  //   const forbidScaling = this.scalingIsForbidden(target, by, scaleProportionally);
  //   let signX: number;
  //   let signY: number;
  //   let scaleX: number;
  //   let scaleY: number;
  //   const { lockScalingX, lockScalingY } = target.style;

  //   if (forbidScaling) {
  //     return false;
  //   }

  //   // TODO: account for rotation
  //   const transform = target.getWorldTransform();
  //   const invert = mat4.invert(mat4.create(), transform);
  //   const newPoint = vec3.transformMat4(
  //     vec3.create(),
  //     vec3.fromValues(canvasX, canvasY, 0),
  //     invert,
  //   );

  //   signX = by !== 'y' ? Math.sign(newPoint[0]) : 1;
  //   signY = by !== 'x' ? Math.sign(newPoint[1]) : 1;
  //   if (!target.style.signX) {
  //     target.style.signX = signX;
  //   }
  //   if (!target.style.signY) {
  //     target.style.signY = signY;
  //   }

  //   if (
  //     target.style.lockScalingFlip &&
  //     (target.style.signX !== signX || target.style.signY !== signY)
  //   ) {
  //     return false;
  //   }

  //   // TODO: scaleProportionally
  //   // if (scaleProportionally && !by) {
  //   //   // uniform scaling
  //   // } else {
  //   //   scaleX = Math.abs(newPoint[0] * target.scaleX / dim.x);
  //   //   scaleY = Math.abs(newPoint[1] * target.scaleY / dim.y);
  //   // }

  //   //

  //   // if (target.style.signX !== signX && by !== 'y') {
  //   //   transform.originX = opposite[transform.originX];
  //   //   scaleX *= -1;
  //   //   target.style.signX = signX;
  //   // }
  //   // if (target.style.signY !== signY && by !== 'x') {
  //   //   transform.originY = opposite[transform.originY];
  //   //   scaleY *= -1;
  //   //   target.style.signY = signY;
  //   // }

  //   // // minScale is taken are in the setter.
  //   // var oldScaleX = target.scaleX, oldScaleY = target.scaleY;
  //   // if (!by) {
  //   //   !lockScalingX && target.set('scaleX', scaleX);
  //   //   !lockScalingY && target.set('scaleY', scaleY);
  //   // }
  //   // else {
  //   //   // forbidden cases already handled on top here.
  //   //   by === 'x' && target.set('scaleX', scaleX);
  //   //   by === 'y' && target.set('scaleY', scaleY);
  //   // }
  //   // return oldScaleX !== target.scaleX || oldScaleY !== target.scaleY;
  // }

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
