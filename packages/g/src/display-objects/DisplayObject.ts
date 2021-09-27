import { isEqual, isObject } from '@antv/util';
import { mat3, mat4, quat, vec2, vec3 } from 'gl-matrix';
import { mix, settings } from 'ts-mixer';
import { DisplayObjectPool } from '../DisplayObjectPool';
import { Element, ElementEvent } from '../dom/Element';
import { container, DisplayObjectConfig, INode, SHAPE } from '..';
import { Visible, Transformable, Animatable } from './mixins';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { fromRotationTranslationScale, getEuler } from '../utils';
import { Renderable } from '../components';
import {
  StylePropertyParser,
  StylePropertyParserFactory,
  StylePropertyUpdater,
  StylePropertyUpdaterFactory,
} from '../property-handlers';
import { dirtifyRenderable } from '../services';

// @see https://github.com/tannerntannern/ts-mixer/blob/master/README.md#dealing-with-constructors
settings.initFunction = 'init';

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
export interface DisplayObject<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Transformable<StyleProps, ParsedStyleProps>,
    Animatable<StyleProps, ParsedStyleProps>,
    Visible<StyleProps, ParsedStyleProps> {}
@mix(Transformable, Animatable, Visible)
export class DisplayObject<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Element<StyleProps, ParsedStyleProps> {
  /**
   * contains style props in constructor's params, eg. fill, stroke...
   */
  config: DisplayObjectConfig<StyleProps>;

  /**
   * a pointer to detached parent after called `remove()`
   */
  removedParentNode: DisplayObject | null = null;

  stylePropertyUpdaterFactory = container.get<
    <Key extends keyof StyleProps>(stylePropertyName: Key) => StylePropertyUpdater<any>[]
  >(StylePropertyUpdaterFactory);

  stylePropertyParserFactory = container.get<
    <Key extends keyof ParsedStyleProps>(stylePropertyName: Key) => StylePropertyParser<any, any>
  >(StylePropertyParserFactory);

  init(config: DisplayObjectConfig<StyleProps>) {
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
    container.get(DisplayObjectPool).add(this.entity.getName(), this);
  }

  destroy() {
    super.destroy();

    // remove from into pool
    container.get(DisplayObjectPool).remove(this.entity.getName());
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
    const renderable = this.entity.getComponent(Renderable);

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
    const stylePropertyParser = this.stylePropertyParserFactory(name);
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
    const stylePropertyUpdaters = this.stylePropertyUpdaterFactory(name);
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
        dirtifyRenderable(target);
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
  add<T extends INode>(child: T, index?: number): T {
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
