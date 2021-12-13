import { isEqual, isNil, isObject } from '@antv/util';
import type { mat3, vec2 } from 'gl-matrix';
import { mat4, quat, vec3 } from 'gl-matrix';
import { DisplayObjectPool } from '../DisplayObjectPool';
import type { Animation } from '../dom/Animation';
import { KeyframeEffect } from '../dom/KeyframeEffect';
import { Element } from '../dom/Element';
import { ElementEvent } from '../dom/interfaces';
import type { DisplayObjectConfig, IElement, IChildNode } from '../dom/interfaces';
import { SHAPE } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { createVec3, fromRotationTranslationScale, getEuler, rad2deg } from '../utils';
// import type { StylePropertyParser, StylePropertyUpdater } from '../property-handlers';
// import { StylePropertyParserFactory, StylePropertyUpdaterFactory } from '../property-handlers';
import {
  globalContainer,
  stylePropertyParserFactory,
  stylePropertyUpdaterFactory,
} from '../global-module';
import { dirtifyToRoot } from '../services';

type ConstructorTypeOf<T> = new (...args: any[]) => T;

const DEFAULT_STYLE_PROPS: {
  anchor: vec2 | vec3;
  origin: vec2 | vec3;
  opacity: number;
  fillOpacity: number;
  strokeOpacity: number;
} = {
  anchor: [0, 0, 0],
  origin: [0, 0, 0],
  opacity: 1,
  fillOpacity: 1,
  strokeOpacity: 1,
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

  /**
   * push to active animations after calling `animate()`
   */
  private activeAnimations: Animation[] = [];

  // stylePropertyUpdaterFactory = globalContainer.get<
  //   <Key extends keyof StyleProps>(stylePropertyName: Key) => StylePropertyUpdater<any>[]
  // >(StylePropertyUpdaterFactory);

  // stylePropertyParserFactory = globalContainer.get<
  //   <Key extends keyof ParsedStyleProps>(stylePropertyName: Key) => StylePropertyParser<any, any>
  // >(StylePropertyParserFactory);

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
    this.className = this.config.className || '';
    this.interactive = this.config.interactive ?? true;
    this.nodeName = this.config.type || SHAPE.Group;

    // compatible with G 3.0
    this.config.style = {
      ...DEFAULT_STYLE_PROPS,
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

    // insert this group into pool
    globalContainer.get(DisplayObjectPool).add(this.entity, this);
  }

  destroy() {
    super.destroy();

    // remove from into pool
    globalContainer.get(DisplayObjectPool).remove(this.entity);

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
      style: { ...this.style },
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

  setAttribute<Key extends keyof StyleProps>(
    attributeName: Key,
    value: StyleProps[Key],
    force = false,
  ) {
    if (
      force ||
      !isEqual(value, this.attributes[attributeName]) ||
      attributeName === 'transformOrigin' ||
      attributeName === 'visibility' // will affect children
    ) {
      if (attributeName === 'visibility') {
        // set value cascade
        this.forEach((object) => {
          (object as DisplayObject).changeAttribute(attributeName, value);
        });
      } else {
        this.changeAttribute(attributeName, value);
      }
      super.setAttribute(attributeName, value);
    }
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
    // const stylePropertyParser = this.stylePropertyParserFactory(name);
    const stylePropertyParser = stylePropertyParserFactory[name as string];
    if (stylePropertyParser) {
      // @ts-ignore
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
    // const stylePropertyUpdaters = this.stylePropertyUpdaterFactory(name);
    const stylePropertyUpdaters = stylePropertyUpdaterFactory[name];
    if (stylePropertyUpdaters) {
      stylePropertyUpdaters.forEach((updater) => {
        // @ts-ignore
        updater(oldParsedValue, newParsedValue, this, this.sceneGraphService);
      });
    }
  }

  /**
   * called when attributes get changed or initialized
   */
  private changeAttribute<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]) {
    const renderable = this.renderable;

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
        dirtifyToRoot(target);
        target.emit(ElementEvent.ATTRIBUTE_CHANGED, {
          attributeName: 'clipPath',
          oldValue: this,
          newValue: this,
        });
      });
    }

    // redraw at next frame
    renderable.dirty = true;

    this.emit(ElementEvent.ATTRIBUTE_CHANGED, {
      attributeName: name,
      oldValue,
      newValue: value,
    });
  }

  // #region transformable
  setOrigin(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setOrigin(this, createVec3(position, y, z));
    this.attributes.origin = this.getOrigin();
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
    this.parsedStyle.transform = undefined;

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
    const cullable = this.cullable;
    return this.style.visibility === 'visible' && (!cullable || (cullable && !cullable.isCulled()));
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
  getMatrix(): mat3 {
    const transform = (this as unknown as DisplayObject).getWorldTransform();
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // #endregion deprecated
}
