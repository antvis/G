import type {
  Cursor,
  DisplayObject,
  FederatedEvent,
  ParsedBaseStyleProps,
} from '@antv/g-lite';
import { Circle, CustomEvent, rad2deg, Rect } from '@antv/g-lite';
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

    this.mask = new Rect({
      style: {
        width: 0,
        height: 0,
        draggable: target.style.maskDraggable === false ? false : true,
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

    this.appendChild(this.mask);

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

    const { halfExtents } = target.getGeometryBounds();
    const width = halfExtents[0] * 2;
    const height = halfExtents[1] * 2;
    const transform = target.getWorldTransform();

    // account for origin object's anchor such as Circle and Ellipse
    const { anchor } = target.parsedStyle as ParsedBaseStyleProps;
    this.mask.translateLocal(-anchor[0] * width, -anchor[1] * height);

    // resize according to target
    this.mask.style.width = width;
    this.mask.style.height = height;

    // position anchors
    this.trAnchor.setLocalPosition(width, 0);
    this.blAnchor.setLocalPosition(0, height);
    this.brAnchor.setLocalPosition(width, height);

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

    // TODO: UI should not be scaled
    this.setLocalTransform(transform);

    this.bindEventListeners();
  }

  deleteSelectedAnchors(): void {}

  destroy(): void {}

  moveMask(dx: number, dy: number) {
    this.translate(dx, dy);
  }

  triggerMovingEvent(dx: number, dy: number) {
    const [ox, oy] = this.getPosition();
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVING, {
        movingX: ox + dx,
        movingY: oy + dy,
        dx,
        dy,
      }),
    );
  }

  triggerMovedEvent() {
    const [x, y] = this.getPosition();
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVED, {
        rect: {
          x,
          y,
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
      const [ox, oy] = this.getPosition();
      const dx = canvasX - shiftX - ox;
      const dy = canvasY - shiftY - oy;

      // account for multi-selection
      this.plugin.selected.forEach((selected) => {
        const selectable = this.plugin.getOrCreateSelectableUI(selected);
        selectable.triggerMovingEvent(dx, dy);
      });
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        const [x, y] = this.getPosition();
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
      const [ox, oy] = this.getPosition();
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
        this.setPosition(maskX, maskY);

        // re-position anchors
        this.tlAnchor.setLocalPosition(0, 0);
        this.trAnchor.setLocalPosition(maskWidth, 0);
        this.blAnchor.setLocalPosition(0, maskHeight);
        this.brAnchor.setLocalPosition(maskWidth, maskHeight);
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
    const lockX = object.style.lockScalingX,
      lockY = object.style.lockScalingY;
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
    return scaleMap[n] + '-resize';
  }
}
