import type {
  BaseCustomElementStyleProps,
  Cursor,
  DisplayObject,
  DisplayObjectConfig,
  FederatedEvent,
  ParsedBaseStyleProps,
} from '@antv/g';
import { Circle, CustomElement, CustomEvent, rad2deg, Rect } from '@antv/g';
import { SelectableEvent } from '../constants/enum';
import type { SelectableStyle } from '../tokens';

interface Props extends BaseCustomElementStyleProps, Partial<SelectableStyle> {
  target: DisplayObject;
}

interface Control {
  x: number;
  y: number;
}

type SelectableStatus = 'active' | 'deactive' | 'moving' | 'resizing';

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

export class SelectableRect extends CustomElement<Props> {
  /**
   * transparent mask
   */
  private mask: Rect;

  // private rotateAnchor: Circle;

  private tlAnchor: Circle;
  private trAnchor: Circle;
  private blAnchor: Circle;
  private brAnchor: Circle;
  private anchors: Circle[] = [];

  status: SelectableStatus;

  constructor({ style, ...rest }: Partial<DisplayObjectConfig<Props>>) {
    super({
      style: {
        selectionFill: 'transparent',
        selectionFillOpacity: 1,
        selectionStroke: 'black',
        selectionStrokeOpacity: 1,
        selectionStrokeWidth: 1,
        selectionLineDash: 0,
        anchorFill: 'black',
        anchorStroke: 'black',
        anchorStrokeOpacity: 1,
        anchorStrokeWidth: 1,
        anchorFillOpacity: 1,
        anchorSize: 6,
        ...style,
      },
      ...rest,
    });

    this.mask = new Rect({
      style: {
        width: 0,
        height: 0,
        draggable: true,
        cursor: 'move',
      },
    });
    this.appendChild(this.mask);

    this.tlAnchor = new Circle({
      style: {
        r: 10,
        cursor: 'nwse-resize',
        draggable: true,
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
  }
  connectedCallback() {
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
    this.mask.style.fill = selectionFill;
    this.mask.style.stroke = selectionStroke;
    this.mask.style.fillOpacity = selectionFillOpacity;
    this.mask.style.strokeOpacity = selectionStrokeOpacity;
    this.mask.style.lineWidth = selectionStrokeWidth;
    this.mask.style.lineDash = selectionLineDash;

    // position anchors
    this.trAnchor.setLocalPosition(width, 0);
    this.blAnchor.setLocalPosition(0, height);
    this.brAnchor.setLocalPosition(width, height);

    // set anchors' style
    this.anchors.forEach((anchor, i) => {
      anchor.style.stroke = anchorStroke;
      anchor.style.fill = anchorFill;
      anchor.style.fillOpacity = anchorFillOpacity;
      anchor.style.strokeOpacity = anchorStrokeOpacity;
      anchor.style.strokeWidth = anchorStrokeWidth;
      anchor.style.r = anchorSize;
      anchor.style.cursor = this.scaleCursorStyleHandler(controls[i], target) as Cursor;
    });

    // TODO: UI should not be scaled
    this.setLocalTransform(transform);

    this.bindEventListeners();
  }
  disconnectedCallback() {}
  attributeChangedCallback<Key extends never>(name: Key, oldValue: {}[Key], newValue: {}[Key]) {
    if (name === 'selectionStroke') {
      this.mask.style.stroke = newValue;
    } else if (name === 'selectionFill') {
      this.mask.style.fill = newValue;
    } else if (name === 'selectionFillOpacity') {
      this.mask.style.fillOpacity = newValue;
    } else if (name === 'selectionStrokeOpacity') {
      this.mask.style.strokeOpacity = newValue;
    } else if (name === 'selectionStrokeWidth') {
      this.mask.style.lineWidth = newValue;
    } else if (name === 'selectionLineDash') {
      this.mask.style.lineDash = newValue;
    } else if (name === 'anchorFill') {
      this.anchors.forEach((anchor) => {
        anchor.style.fill = newValue;
      });
    } else if (name === 'anchorStrokeWidth') {
      this.anchors.forEach((anchor) => {
        anchor.style.strokeWidth = newValue;
      });
    } else if (name === 'anchorStroke') {
      this.anchors.forEach((anchor) => {
        anchor.style.stroke = newValue;
      });
    } else if (name === 'anchorSize') {
      this.anchors.forEach((anchor) => {
        anchor.style.r = newValue;
      });
    } else if (name === 'anchorStrokeOpacity') {
      this.anchors.forEach((anchor) => {
        anchor.style.strokeOpacity = newValue;
      });
    } else if (name === 'anchorFillOpacity') {
      this.anchors.forEach((anchor) => {
        anchor.style.fillOpacity = newValue;
      });
    }
  }

  private bindEventListeners() {
    const { target: targetObject } = this.style;
    const camera = this.ownerDocument.defaultView.getCamera();

    // listen to drag'n'drop events
    let shiftX = 0;
    let shiftY = 0;
    const moveAt = (canvasX: number, canvasY: number) => {
      this.setPosition(canvasX - shiftX, canvasY - shiftY);

      targetObject.dispatchEvent(
        new CustomEvent(SelectableEvent.MOVING, {
          movingX: canvasX - shiftX,
          movingY: canvasY - shiftY,
        }),
      );
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        this.status = 'moving';

        const [x, y] = this.getPosition();
        shiftX = e.canvasX - x;
        shiftY = e.canvasY - y;

        moveAt(e.canvasX, e.canvasY);
      }
    });
    this.addEventListener('drag', (e: FederatedEvent) => {
      const zoom = camera.getZoom();
      const target = e.target as DisplayObject;

      const { canvasX, canvasY } = e;
      const originMaskWidth = Number(this.mask.style.width);
      const originMaskHeight = Number(this.mask.style.height);

      const [ox, oy] = this.getPosition();

      // @ts-ignore
      const dx = e.dx / zoom;
      // @ts-ignore
      const dy = e.dy / zoom;

      if (target === this.mask) {
        this.status = 'moving';

        moveAt(canvasX, canvasY);
      } else if (
        target === this.tlAnchor ||
        target === this.trAnchor ||
        target === this.blAnchor ||
        target === this.brAnchor
      ) {
        // this.scaleObject();

        let maskX: number;
        let maskY: number;
        let maskWidth: number;
        let maskHeight: number;

        if (target === this.tlAnchor) {
          maskWidth = originMaskWidth - dx;
          maskHeight = originMaskHeight - dy;
          maskX = canvasX;
          maskY = canvasY;
        } else if (target === this.trAnchor) {
          maskWidth = originMaskWidth + dx;
          maskHeight = originMaskHeight - dy;
          maskX = ox;
          maskY = oy + dy;
        } else if (target === this.blAnchor) {
          maskWidth = originMaskWidth - dx;
          maskHeight = originMaskHeight + dy;
          maskX = ox + dx;
          maskY = oy;
        } else if (target === this.brAnchor) {
          maskWidth = originMaskWidth + dx;
          maskHeight = originMaskHeight + dy;
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

        targetObject.dispatchEvent(
          new CustomEvent(SelectableEvent.MODIFIED, {
            positionX: maskX,
            positionY: maskY,
            scaleX: maskWidth / originMaskWidth,
            scaleY: maskHeight / originMaskHeight,
          }),
        );
      }
    });
    this.addEventListener('dragend', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        this.status = 'active';
      }

      targetObject.dispatchEvent(new CustomEvent(SelectableEvent.MOVED));
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

  private scalingIsForbidden(object: DisplayObject, by: string, scaleProportionally: boolean) {
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
