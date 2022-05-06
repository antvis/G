import { GlobalContainer } from 'mana-syringe';
import type { mat3, vec2 } from 'gl-matrix';
import { mat4, quat, vec3 } from 'gl-matrix';
import { DisplayObjectPool } from '../DisplayObjectPool';
import type { Animation } from '../dom/Animation';
import { KeyframeEffect } from '../dom/KeyframeEffect';
import { Element } from '../dom/Element';
import { ElementEvent } from '../dom/interfaces';
import type {
  DisplayObjectConfig,
  IElement,
  IChildNode,
  ICSSStyleDeclaration,
} from '../dom/interfaces';
import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import {
  createVec3,
  decompose,
  formatAttribute,
  fromRotationTranslationScale,
  getEuler,
  isNil,
  isObject,
  isUndefined,
  rad2deg,
} from '../utils';
import { dirtifyToRoot } from '../services';
import { MutationEvent } from '../dom/MutationEvent';
import { Rectangle } from '../shapes';
import type { PropertyParseOptions } from '../css/StyleValueRegistry';
import { StyleValueRegistry } from '../css/StyleValueRegistry';
import { CSSUnitValue } from '../css';

type ConstructorTypeOf<T> = new (...args: any[]) => T;

const DEFAULT_STYLE_PROPS: {
  x: number | string;
  y: number | string;
  z: number | string;
  anchor: [number, number] | [number, number, number];
  transformOrigin: string;
  visibility: string;
  pointerEvents: string;
  opacity: string;
  fillOpacity: string;
  strokeOpacity: string;
  fill: string;
  stroke: string;
  lineCap: CanvasLineCap | '';
  lineJoin: CanvasLineJoin | '';
  fontSize: string | number;
  fontFamily: string;
  fontStyle: string;
  fontWeight: string;
  fontVariant: string;
  textAlign: string;
  textBaseline: string;
  textTransform: string;
} = {
  x: '',
  y: '',
  z: '',
  anchor: [0, 0],
  opacity: '',
  fillOpacity: '',
  strokeOpacity: '',
  fill: '',
  stroke: '',
  transformOrigin: '',
  visibility: '',
  pointerEvents: '',
  lineCap: '',
  lineJoin: '',
  fontSize: '',
  fontFamily: '',
  fontStyle: '',
  fontWeight: '',
  fontVariant: '',
  textAlign: '',
  textBaseline: '',
  textTransform: '',
};

/**
 * prototype chains: DisplayObject -> Element -> Node -> EventTarget
 *
 * mixins: Animatable, Transformable, Visible
 * @see https://github.com/tannerntannern/ts-mixer/blob/master/README.md#mixing-generic-classes
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
  /**
   * contains style props in constructor's params, eg. fill, stroke...
   */
  config: DisplayObjectConfig<StyleProps>;

  styleValueRegistry = GlobalContainer.get(StyleValueRegistry);

  /**
   * push to active animations after calling `animate()`
   */
  private activeAnimations: Animation[] = [];

  constructor(config: DisplayObjectConfig<StyleProps>) {
    super();
    // assign name, id to config
    // eg. group.get('name')
    this.config = config;

    // compatible with G 3.0
    this.config.interactive = this.config.capture ?? this.config.interactive;

    // init scene graph node
    this.id = this.config.id || '';
    this.name = this.config.name || '';
    if (this.config.className || this.config.class) {
      this.className = this.config.className || this.config.class;
    }
    this.nodeName = this.config.type || Shape.GROUP;

    // compatible with G 3.0
    this.config.style = {
      ...DEFAULT_STYLE_PROPS,
      zIndex: this.config.zIndex ?? 0,
      interactive: this.config.interactive ?? true,
      ...this.config.style,
      ...this.config.attrs,
    };
    if (this.config.visible != null) {
      this.config.style.visibility = this.config.visible === false ? 'hidden' : 'visible';
    }
    if (this.config.interactive != null) {
      this.config.style.pointerEvents = this.config.interactive === false ? 'none' : 'auto';
    }

    this.style = new Proxy<StyleProps & ICSSStyleDeclaration<StyleProps>>(
      {
        ...this.attributes,
        setProperty: <Key extends keyof StyleProps>(
          propertyName: Key,
          value: StyleProps[Key],
          // priority?: string,
        ) => {
          this.setAttribute(propertyName, value);
        },
        getPropertyValue: (propertyName: keyof StyleProps) => {
          return this.getAttribute(propertyName);
        },
        removeProperty: (propertyName: keyof StyleProps) => {
          this.removeAttribute(propertyName);
        },
        item: () => {
          return '';
        },
      },
      {
        get: (target, name) => {
          if (name in target) {
            return target[name];
          }
          return this.getAttribute(name as keyof StyleProps);
        },
        set: (_, prop, value) => {
          this.setAttribute(prop as keyof StyleProps, value);
          return true;
        },
      },
    );

    this.initAttributes(this.config.style);

    // insert this group into pool
    GlobalContainer.get(DisplayObjectPool).add(this.entity, this);
  }

  destroy() {
    super.destroy();

    // remove from into pool
    GlobalContainer.get(DisplayObjectPool).remove(this.entity);

    // stop all active animations
    this.getAnimations().forEach((animation) => {
      animation.cancel();
    });
  }

  cloneNode(deep?: boolean): this {
    const cloned = new (this.constructor as ConstructorTypeOf<DisplayObject>)({
      // copy id & name
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes
      id: this.id,
      name: this.name,
      className: this.name,
      interactive: this.interactive,
      style: { ...this.attributes },
    });

    if (deep) {
      this.children.forEach((child) => {
        const clonedChild = child.cloneNode(deep);
        cloned.appendChild(clonedChild);
      });
    }

    return cloned as this;
  }

  private initAttributes(attributes: StyleProps = {} as StyleProps) {
    const renderable = this.renderable;

    this.styleValueRegistry.processProperties(this, attributes);

    // redraw at next frame
    renderable.dirty = true;
  }

  setAttribute<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key], force = false) {
    const [attributeName, attributeValue] = formatAttribute(name as string, value) as [
      Key,
      StyleProps[Key],
    ];
    // ignore undefined value
    if (isUndefined(value)) {
      return;
    }

    if (force || attributeValue != this.attributes[attributeName]) {
      this.internalSetAttribute(attributeName, attributeValue);
      super.setAttribute(attributeName, attributeValue);
    }
  }

  /**
   * called when attributes get changed or initialized
   */
  internalSetAttribute<Key extends keyof StyleProps>(
    name: Key,
    value: StyleProps[Key],
    parseOptions: Partial<PropertyParseOptions> = {},
  ) {
    const renderable = this.renderable;

    const oldValue = this.attributes[name];
    const oldParsedValue = this.parsedStyle[name as string];

    this.styleValueRegistry.processProperties(
      this,
      {
        [name]: value,
      },
      parseOptions,
    );

    // inform clip path targets
    if (this.attributes.clipPathTargets && this.attributes.clipPathTargets.length) {
      this.attributes.clipPathTargets.forEach((target) => {
        dirtifyToRoot(target);
        target.dispatchEvent(
          new MutationEvent(
            ElementEvent.ATTR_MODIFIED,
            target as IElement,
            this,
            this,
            'clipPath',
            MutationEvent.MODIFICATION,
            this,
            this,
          ),
        );
      });
    }

    // redraw at next frame
    renderable.dirty = true;

    this.dispatchEvent(
      new MutationEvent(
        ElementEvent.ATTR_MODIFIED,
        this as IElement,
        oldValue,
        value,
        name as string,
        MutationEvent.MODIFICATION,
        oldParsedValue,
        this.parsedStyle[name as string],
      ),
    );
  }

  // #region transformable
  /**
   * returns different values than getBoundingClientRect(), as the latter returns value relative to the viewport
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox
   *
   * FIXME: It is worth noting that getBBox responds to original untransformed values of a drawn object.
   * @see https://www.w3.org/Graphics/SVG/IG/resources/svgprimer.html#getBBox
   */
  getBBox(): DOMRect {
    const aabb = this.getBounds();
    const [left, top] = aabb.getMin();
    const [right, bottom] = aabb.getMax();
    return new Rectangle(left, top, right - left, bottom - top);
  }

  setOrigin(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setOrigin(this, createVec3(position, y, z));
    return this;
  }

  getOrigin(): vec3 {
    return this.sceneGraphService.getOrigin(this);
  }

  /**
   * set position in world space
   */
  setPosition(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setPosition(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setLocalPosition(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translate(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translateLocal(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  getPosition(): vec3 {
    return this.sceneGraphService.getPosition(this);
  }

  getLocalPosition(): vec3 {
    return this.sceneGraphService.getLocalPosition(this);
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
    this.sceneGraphService.scaleLocal(this, scaling);
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

    this.sceneGraphService.setLocalScale(this, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale(): vec3 {
    return this.sceneGraphService.getLocalScale(this);
  }

  /**
   * get scaling in world space
   */
  getScale(): vec3 {
    return this.sceneGraphService.getScale(this);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getWorldTransform(this));
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getLocalRotation(this));
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraphService.setEulerAngles(this, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraphService.setLocalEulerAngles(this, 0, 0, z);
    return this;
  }

  rotateLocal(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotateLocal(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotateLocal(this, x, y, z);
    }

    return this;
  }

  rotate(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotate(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotate(this, x, y, z);
    }

    return this;
  }

  setRotation(rotation: quat | number, y?: number, z?: number, w?: number) {
    this.sceneGraphService.setRotation(this, rotation, y, z, w);
    return this;
  }

  setLocalRotation(rotation: quat | number, y?: number, z?: number, w?: number) {
    this.sceneGraphService.setLocalRotation(this, rotation, y, z, w);
    return this;
  }

  getRotation(): quat {
    return this.sceneGraphService.getRotation(this);
  }

  getLocalRotation(): quat {
    return this.sceneGraphService.getLocalRotation(this);
  }

  getLocalTransform(): mat4 {
    return this.sceneGraphService.getLocalTransform(this);
  }

  getWorldTransform(): mat4 {
    return this.sceneGraphService.getWorldTransform(this);
  }

  resetLocalTransform(): void {
    this.sceneGraphService.resetLocalTransform(this);
  }

  /**
   * sync style.x/y when local position changed
   *
   * Mixins may not declare private/protected properties
   * however, you can use ES2020 private fields
   */
  private syncLocalPosition() {
    const localPosition = this.getLocalPosition();
    this.attributes.x = localPosition[0];
    this.attributes.y = localPosition[1];
    this.attributes.z = localPosition[2];
    // should not affect computed style
    this.parsedStyle.x = new CSSUnitValue(this.attributes.x, 'px');
    this.parsedStyle.y = new CSSUnitValue(this.attributes.y, 'px');
    this.parsedStyle.z = new CSSUnitValue(this.attributes.z, 'px');
  }
  // #endregion transformable

  // #region animatable
  /**
   * returns an array of all Animation objects affecting this element
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations
   */
  getAnimations(): Animation[] {
    return this.activeAnimations;
  }
  /**
   * create an animation with WAAPI
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/animate
   */
  animate(
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions | undefined,
  ): Animation | null {
    let timeline = this.ownerDocument?.timeline;

    // accounte for clip path, use target's timeline
    if (this.attributes.clipPathTargets && this.attributes.clipPathTargets.length) {
      const target = this.attributes.clipPathTargets[0];
      timeline = target.ownerDocument?.timeline;
    }

    // clear old parsed transform
    delete this.parsedStyle.transform;

    if (timeline) {
      return timeline.play(new KeyframeEffect(this as IElement, keyframes, options));
    }
    return null;
  }
  // #endregion animatable

  // #region visible
  /**
   * show group, which will also change visibility of its children in sceneGraphNode
   *
   * @deprecated
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/visibility
   */
  show() {
    this.style.visibility = 'visible';
  }

  /**
   * @deprecated
   * hide group, which will also change visibility of its children in sceneGraphNode
   */
  hide() {
    this.style.visibility = 'hidden';
  }

  /**
   * shortcut for Used value of `visibility`
   */
  isVisible() {
    return this.parsedStyle?.visibility?.value === 'visible';
  }

  get interactive() {
    return this.isInteractive();
  }
  set interactive(b: boolean) {
    this.style.pointerEvents = b ? 'auto' : 'none';
  }

  isInteractive() {
    return this.parsedStyle?.pointerEvents?.value !== 'none';
  }

  isCulled() {
    return !!(this.cullable && this.cullable.isCulled());
  }

  /**
   * bring to front in current group
   */
  toFront() {
    if (this.parentNode) {
      this.style.zIndex =
        Math.max(...this.parentNode.children.map((child) => Number(child.style.zIndex))) + 1;
    }
    return this;
  }

  /**
   * send to back in current group
   */
  toBack() {
    if (this.parentNode) {
      this.style.zIndex =
        Math.min(...this.parentNode.children.map((child) => Number(child.style.zIndex))) - 1;
    }
    return this;
  }
  // #endregion visible

  // #region deprecated
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
  getParent(): DisplayObject | null {
    return this.parentElement as DisplayObject;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getChildren(): DisplayObject[] {
    return this.children as DisplayObject[];
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   */
  getFirst(): DisplayObject | null {
    return this.firstElementChild as DisplayObject;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   * get last child group/shape
   */
  getLast(): DisplayObject | null {
    return this.lastElementChild as DisplayObject;
  }

  /**
   * @deprecated
   * compatible with G 3.0
   * @deprecated
   * get child group/shape by index
   */
  getChildByIndex(index: number): DisplayObject | null {
    return (this.children[index] as DisplayObject) || null;
  }

  /**
   * compatible with G 3.0
   * @deprecated
   */
  add<T extends IChildNode>(child: T, index?: number): T {
    return this.appendChild(child, index);
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
    return this.style.clipPath || null;
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

  /**
   * compatible with G 3.0
   * @deprecated
   */
  get(name: keyof DisplayObjectConfig<StyleProps>) {
    return this.config[name];
  }

  /**
   * compatible with G 3.0
   * @alias object.config
   * @deprecated
   */
  getConfig() {
    return this.config;
  }

  /**
   * @alias style
   * @example
   * circle.style.r = 10;
   * const r = circle.style;
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
        this.setAttribute(
          key as keyof StyleProps,
          (name as unknown as StyleProps)[key as keyof StyleProps],
        );
      });
      return this;
    }
    if (args.length === 2) {
      this.setAttribute(name, value);
      return this;
    }
    return this.attributes[name as keyof StyleProps];
  }

  /**
   * @alias setPosition
   * @deprecated
   */
  moveTo(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    (this as unknown as DisplayObject).setPosition(position, y, z);
    return this;
  }

  /**
   * @alias setPosition
   * @deprecated
   */
  move(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    (this as unknown as DisplayObject).setPosition(position, y, z);
    return this;
  }

  /**
   * @alias style.zIndex
   * @deprecated
   */
  setZIndex(zIndex: number) {
    this.style.zIndex = zIndex;
    return this;
  }

  /**
   * return 3x3 matrix in world space
   * @deprecated
   */
  getMatrix(transformMat4?: mat4): mat3 {
    const transform = transformMat4 || this.getWorldTransform();
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);
    // gimbal lock at 90 degrees
    return fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);
  }

  /**
   * return 3x3 matrix in local space
   * @deprecated
   */
  getLocalMatrix(): mat3 {
    return this.getMatrix(this.getLocalTransform());
  }

  /**
   * set 3x3 matrix in world space
   * @deprecated
   */
  setMatrix(mat: mat3) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(mat);
    this.setEulerAngles(angle).setPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  /**
   * set 3x3 matrix in local space
   * @deprecated
   */
  setLocalMatrix(mat: mat3) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(mat);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  // #endregion deprecated
}
