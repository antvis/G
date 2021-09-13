import { isObject, isNil } from '@antv/util';
import type { mat3 } from 'gl-matrix';
import { vec2, vec3, mat4, quat } from 'gl-matrix';
import { Renderable, Transform } from './components';
import { createVec3, rad2deg, getEuler, fromRotationTranslationScale } from './utils/math';
import type { BaseStyleProps, ParsedBaseStyleProps } from './types';
import { SHAPE } from './types';
import { DisplayObjectPool } from './DisplayObjectPool';
import { container } from './inversify.config';
import type { StylePropertyUpdater, StylePropertyParser } from './property-handlers';
import { StylePropertyUpdaterFactory, StylePropertyParserFactory } from './property-handlers';
import { DISPLAY_OBJECT_EVENT, Element } from './dom/Element';

export interface DisplayObjectConfig<StyleProps> {
  /**
   * element's identifier, must be unique in a document.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id?: string;

  name?: string;

  className?: string;

  /**
   * all styles properties, not read-only
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
   */
  style?: StyleProps;
  /**
   * compatible with G 3.0
   * @alias style
   * @deprecated
   */
  attrs?: StyleProps;

  type?: SHAPE | string;

  /**
   * @deprecated use `style.zIndex` instead
   */
  zIndex?: number;
  /**
   * @deprecated use `style.visibility = 'visible'` instead
   */
  visible?: boolean;
  /**
   * compatible with G 3.0
   * @alias interactive
   * @deprecated
   */
  capture?: boolean;

  /**
   * enable interaction events for the DisplayObject
   */
  interactive?: boolean;
}

/**
 * prototype chains: DisplayObject -> Element -> Node -> EventTarget
 *
 * Provide abilities in scene graph, such as:
 * * transform `translate/rotate/scale`
 * * add/remove child
 * * visibility and z-index
 *
 * Those abilities are implemented with those components: `Transform/Sortable/Visible`.
 *
 * Emit following events:
 * * init
 * * destroy
 * * attributeChanged
 */
export class DisplayObject<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Element<StyleProps, ParsedStyleProps> {
  protected config: DisplayObjectConfig<StyleProps>;

  shadow = false;

  private displayObjectPool: DisplayObjectPool = container.get(DisplayObjectPool);

  private stylePropertyUpdaterFactory = container.get<
    <Key extends keyof StyleProps>(stylePropertyName: Key) => StylePropertyUpdater<any>[]
  >(StylePropertyUpdaterFactory);

  private stylePropertyParserFactory = container.get<
    <Key extends keyof ParsedStyleProps>(stylePropertyName: Key) => StylePropertyParser<any, any>
  >(StylePropertyParserFactory);

  constructor(config: DisplayObjectConfig<StyleProps>) {
    super();

    // assign name, id to config
    // eg. group.get('name')
    this.config = config;

    // insert this group into pool
    this.displayObjectPool.add(this.entity.getName(), this);

    // compatible with G 3.0
    this.config.interactive = this.config.capture ?? this.config.interactive;

    // init scene graph node
    this.id = this.config.id || '';
    this.name = this.config.name || '';
    this.className = this.config.className || '';
    this.interactive = this.config.interactive ?? true;
    this.nodeName = this.config.type || SHAPE.Group;
    this.attributes;

    // compatible with G 3.0
    // @ts-ignore
    this.config.style = {
      zIndex: this.config.zIndex ?? 0,
      visibility: this.config.visible === false ? 'hidden' : 'visible',
      ...this.config.style,
      ...this.config.attrs,
    };

    this.style = new Proxy<StyleProps>(this.attributes, {
      get: (_, prop) => {
        return this.getAttribute(prop as keyof StyleProps);
      },
      set: (_, prop, value) => {
        this.setAttribute(prop as keyof StyleProps, value);
        return true;
      },
    });

    this.initAttributes(this.config.style);

    this.on(DISPLAY_OBJECT_EVENT.ChildInserted, (child: DisplayObject) => {
      // when appending to document
      if (
        this.ownerDocument &&
        this.ownerDocument.documentElement === this &&
        this.ownerDocument.defaultView
      ) {
        this.ownerDocument.defaultView.decorate(
          child,
          this.ownerDocument.defaultView.getRenderingService(),
          this,
        );
      }
    });
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  set<Key extends keyof DisplayObjectConfig<StyleProps>>(
    name: Key,
    value: DisplayObjectConfig<StyleProps>[Key],
  ) {
    this.config[name] = value;
  }
  get(name: keyof DisplayObjectConfig<StyleProps>) {
    return this.config[name];
  }
  getConfig() {
    return this.config;
  }

  /**
   * @deprecated
   */
  attr(): StyleProps;
  attr(name: Partial<StyleProps>): DisplayObject<StyleProps>;
  attr<Key extends keyof StyleProps>(name: Key): StyleProps[Key];
  attr<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]): DisplayObject<StyleProps>;
  attr(...args: any): any {
    const [name, value] = args;
    if (!name) {
      return this.attributes;
    }
    if (isObject(name)) {
      Object.keys(name).forEach((key) => {
        this.setAttribute(key as keyof StyleProps, (name as StyleProps)[key as keyof StyleProps]);
      });
      return this;
    }
    if (args.length === 2) {
      this.setAttribute(name, value);
      return this;
    }
    return this.attributes[name as keyof StyleProps];
  }

  /** scene graph operations */

  scrollLeft = 0;
  scrollTop = 0;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
   */
  dataset: Record<string, any> = {};

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getCount() {
    return this.childElementCount;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getParent(): this | null {
    return this.parentNode;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getChildren(): this[] {
    return this.children;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getFirst(): this | null {
    return this.firstChild;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   * get last child group/shape
   */
  getLast(): this | null {
    return this.lastChild;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   * get child group/shape by index
   */
  getChildByIndex(index: number): this | null {
    return this.children[index] || null;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  add(child: this, index?: number) {
    this.appendChild(child, index);
  }

  /** transform operations */

  setOrigin(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setOrigin<DisplayObject>(this, createVec3(position, y, z));
    return this;
  }
  getOrigin(): vec3 {
    return this.sceneGraphService.getOrigin<DisplayObject>(this);
  }

  /**
   * alias setPosition
   */
  moveTo(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.setPosition(position, y, z);
    return this;
  }
  /**
   * alias setPosition
   */
  move(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.setPosition(position, y, z);
    return this;
  }
  /**
   * compatible with G 3.0
   *
   * set position in world space
   */
  setPosition(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setPosition<DisplayObject>(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setLocalPosition<DisplayObject>(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translate<DisplayObject>(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translateLocal<DisplayObject>(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  getPosition(): vec3 {
    return this.sceneGraphService.getPosition<DisplayObject>(this);
  }

  getLocalPosition(): vec3 {
    return this.sceneGraphService.getLocalPosition<DisplayObject>(this);
  }

  /**
   * compatible with G 3.0
   *
   * scaling in local space
   * scale(10) = scale(10, 10, 10)
   *
   * we can't set scale in world space
   */
  scale(scaling: vec3 | vec2 | number, y?: number, z?: number) {
    return this.scaleLocal(scaling, y, z);
  }
  scaleLocal(scaling: vec3 | vec2 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }
    this.sceneGraphService.scaleLocal<DisplayObject>(this, scaling);
    return this;
  }

  /**
   * set scaling in local space
   */
  setLocalScale(scaling: vec3 | vec2 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }

    this.sceneGraphService.setLocalScale<DisplayObject>(this, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale(): vec3 {
    return this.sceneGraphService.getLocalScale<DisplayObject>(this);
  }

  /**
   * get scaling in world space
   */
  getScale(): vec3 {
    return this.sceneGraphService.getScale<DisplayObject>(this);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    const transform = this.entity.getComponent(Transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(
      vec3.create(),
      this.sceneGraphService.getWorldTransform<DisplayObject>(this, transform),
    );
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(
      vec3.create(),
      this.sceneGraphService.getLocalRotation<DisplayObject>(this),
    );
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraphService.setEulerAngles<DisplayObject>(this, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraphService.setLocalEulerAngles<DisplayObject>(this, 0, 0, z);
    return this;
  }

  rotateLocal(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotateLocal<DisplayObject>(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotateLocal<DisplayObject>(this, x, y, z);
    }

    return this;
  }

  rotate(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotate<DisplayObject>(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotate<DisplayObject>(this, x, y, z);
    }

    return this;
  }

  getRotation(): quat {
    return this.sceneGraphService.getRotation<DisplayObject>(this);
  }

  getLocalRotation(): quat {
    return this.sceneGraphService.getLocalRotation<DisplayObject>(this);
  }

  getLocalTransform(): mat4 {
    return this.sceneGraphService.getLocalTransform<DisplayObject>(this);
  }

  getWorldTransform(): mat4 {
    return this.sceneGraphService.getWorldTransform<DisplayObject>(this);
  }

  /**
   * return 3x3 matrix in world space
   * @deprecated
   */
  getMatrix(): mat3 {
    const transform = this.getWorldTransform();
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);
    // gimbal lock at 90 degrees
    return fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);
  }
  /**
   * set 3x3 matrix in world space
   * @deprecated
   */
  setMatrix(mat: mat3) {
    let row0x = mat[0];
    let row0y = mat[3];
    let row1x = mat[1];
    let row1y = mat[4];
    // decompose 3x3 matrix
    // @see https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix
    let scalingX = Math.sqrt(row0x * row0x + row0y * row0y);
    let scalingY = Math.sqrt(row1x * row1x + row1y * row1y);

    // If determinant is negative, one axis was flipped.
    const determinant = row0x * row1y - row0y * row1x;
    if (determinant < 0) {
      // Flip axis with minimum unit vector dot product.
      if (row0x < row1y) {
        scalingX = -scalingX;
      } else {
        scalingY = -scalingY;
      }
    }

    // Renormalize matrix to remove scale.
    if (scalingX) {
      row0x *= 1 / scalingX;
      row0y *= 1 / scalingX;
    }
    if (scalingY) {
      row1x *= 1 / scalingY;
      row1y *= 1 / scalingY;
    }

    // Compute rotation and renormalize matrix.
    const angle = Math.atan2(row0y, row0x);

    this.setEulerAngles(angle).setPosition(mat[6], mat[7]).setLocalScale(scalingX, scalingY);
  }

  /* z-index & visibility */

  setZIndex(zIndex: number) {
    this.style.zIndex = zIndex;
  }

  /**
   * bring to front in current group
   */
  toFront() {
    if (this.parentNode) {
      const zIndex =
        Math.max(...this.parentNode.children.map((child) => Number(child.style.zIndex))) + 1;
      this.setZIndex(zIndex);
    }
  }

  /**
   * send to back in current group
   */
  toBack() {
    if (this.parentNode) {
      const zIndex =
        Math.min(...this.parentNode.children.map((child) => Number(child.style.zIndex))) - 1;
      this.setZIndex(zIndex);
    }
  }

  /**
   * show group, which will also change visibility of its children in sceneGraphNode
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
   */
  show() {
    this.style.visibility = 'visible';
  }

  /**
   * hide group, which will also change visibility of its children in sceneGraphNode
   */
  hide() {
    this.style.visibility = 'hidden';
  }

  isVisible() {
    return this.style.visibility === 'visible';
  }

  /**
   * @alias style.clipPath
   * @deprecated
   */
  setClip(clipPath: DisplayObject | null) {
    this.style.clipPath = clipPath;
  }

  /**
   * @alias style.clipPath
   * @deprecated
   */
  getClip() {
    return this.style.clipPath;
  }

  /**
   * parse property, eg.
   * * fill: 'red' => [1, 0, 0, 1]
   * * translateX: '10px' => { unit: 'px', value: 10 }
   */
  private parseStyleProperty<Key extends keyof ParsedStyleProps>(
    name: Key,
    value: ParsedStyleProps[Key],
  ) {
    const stylePropertyParser = this.stylePropertyParserFactory(name);
    if (stylePropertyParser) {
      this.parsedStyle[name] = stylePropertyParser(value, this);
    } else {
      this.parsedStyle[name] = value;
    }
  }

  private updateStyleProperty<Key extends keyof ParsedStyleProps>(
    name: Key,
    oldParsedValue: ParsedStyleProps[Key],
    newParsedValue: ParsedStyleProps[Key],
  ) {
    // update property, which may cause AABB re-calc
    // @ts-ignore
    const stylePropertyUpdaters = this.stylePropertyUpdaterFactory(name);
    if (stylePropertyUpdaters) {
      stylePropertyUpdaters.forEach((updater) => {
        updater(oldParsedValue, newParsedValue, this, this.sceneGraphService);
      });
    }
  }

  /**
   * called when attributes get changed or initialized
   */
  protected changeAttribute<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]) {
    const entity = this.getEntity();
    const renderable = entity.getComponent(Renderable);

    const oldValue = this.attributes[name];
    // @ts-ignore
    const oldParsedValue = this.parsedStyle[name];

    // update value
    this.attributes[name] = value;

    // @ts-ignore
    this.parseStyleProperty(name, value);

    // @ts-ignore
    this.updateStyleProperty(name, oldParsedValue, this.parsedStyle[name]);

    // inform clip path targets
    if (this.attributes.clipPathTargets && this.attributes.clipPathTargets.length) {
      this.attributes.clipPathTargets.forEach((target) => {
        const targetRenderable = target.getEntity().getComponent(Renderable);
        targetRenderable.dirty = true;
        targetRenderable.aabbDirty = true;

        target.emitter.emit(DISPLAY_OBJECT_EVENT.AttributeChanged, 'clipPath', this, this, target);
      });
    }

    // redraw at next frame
    renderable.dirty = true;

    this.emitter.emit(DISPLAY_OBJECT_EVENT.AttributeChanged, name, oldValue, value, this);
  }

  private initAttributes(attributes: StyleProps = {} as StyleProps) {
    const entity = this.getEntity();
    const renderable = entity.getComponent(Renderable);

    // parse attributes first
    for (const attributeName in attributes) {
      const value = attributes[attributeName];
      this.attributes[attributeName] = value;
      // @ts-ignore
      this.parseStyleProperty(attributeName, value);
    }

    const priorities: Record<string, number> = {
      x: 1000,
      y: 1000,
    };

    // update x, y at last
    const sortedNames = Object.keys(attributes).sort(
      (a, b) => (priorities[a] || 0) - (priorities[b] || 0),
    );
    sortedNames.forEach((attributeName) => {
      // @ts-ignore
      this.updateStyleProperty(attributeName, undefined, this.parsedStyle[attributeName]);
    });

    // redraw at next frame
    renderable.dirty = true;
  }

  /**
   * sync style.x/y when local position changed
   */
  private syncLocalPosition() {
    const localPosition = this.getLocalPosition();
    this.attributes.x = localPosition[0];
    this.attributes.y = localPosition[1];
  }
}
