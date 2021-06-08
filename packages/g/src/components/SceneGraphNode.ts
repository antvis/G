import { Component, Entity } from '@antv/g-ecs';
import { SHAPE, ShapeAttrs } from '../types';

/**
 * scene graph node, try to mimic `Element`
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
 */
export class SceneGraphNode<Attributes> extends Component {
  static tag = 'c-scene-graph-node';
  frozen = false;

  /**
   * hierarchy
   */
  parent: Entity | null = null;
  children: Entity[] = [];
  /**
   * index of layer, eg.
   * * root -1
   * * root's children 0
   */
  hierarchyIndex: number = -1;

  /**
   * used with `getElementById()`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/id
   */
  id: string;

  /**
   * used with `getElementsByClassName()`
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class
   */
  class: string;

  /**
   * used with `getElementsByTagName()`
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
   */
  tagName: SHAPE;

  /**
   * assigned by shape.attrs
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
   */
  attributes: ShapeAttrs;

  /**
   * shadow node, invisible in scene graph, which means cannot be queried
   */
  shadow = false;
}
