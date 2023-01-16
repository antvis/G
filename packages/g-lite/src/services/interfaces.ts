import type { mat4, quat, vec2, vec3 } from 'gl-matrix';
import type { Transform } from '../components';
import type { IElement, INode, IParentNode } from '../dom';
import type { AABB, Rectangle } from '../shapes';
import type { DisplayObject } from '../display-objects';

export interface SceneGraphService {
  triggerPendingEvents: () => void;
  clearPendingEvents: () => void;
  updateDisplayObjectDependency: (
    name: string,
    oldPath: DisplayObject,
    newPath: DisplayObject,
    object: DisplayObject,
  ) => void;
  informDependentDisplayObjects: (object: DisplayObject) => void;
  dirtifyToRoot: (element: INode, affectChildren?: boolean) => void;
  matches: <T extends IElement>(query: string, root: T) => boolean;
  querySelector: <R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ) => T | null;
  querySelectorAll: <R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ) => T[];
  attach: <C extends INode, P extends INode & IParentNode>(
    child: C,
    parent: P,
    index?: number,
  ) => void;
  detach: <C extends INode>(child: C) => void;
  getOrigin: (element: INode) => vec3;
  setOrigin: (
    element: INode,
    origin: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  setPosition: (element: INode, position: vec3 | vec2) => void;
  setLocalPosition: (element: INode, position: vec3 | vec2) => void;
  scaleLocal: (element: INode, scaling: vec3 | vec2) => void;
  setLocalScale: (element: INode, scaling: vec3 | vec2) => void;
  getLocalScale: (element: INode) => vec3;
  getScale: (element: INode) => vec3;
  getLocalSkew: (element: INode) => vec2;
  translate: (
    element: INode,
    translation: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  translateLocal: (
    element: INode,
    translation: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  getPosition: (element: INode) => vec3;
  getLocalPosition: (element: INode) => vec3;
  setLocalSkew: (element: INode, skew: vec2 | number, y?: number) => void;
  setEulerAngles: (
    element: INode,
    degrees: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  setLocalEulerAngles: (
    element: INode,
    degrees: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  rotateLocal: (
    element: INode,
    degrees: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  rotate: (
    element: INode,
    degrees: vec3 | number,
    y?: number,
    z?: number,
  ) => void;
  getRotation: (element: INode) => quat;
  setRotation: (
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
  ) => void;
  setLocalRotation: (
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
  ) => void;
  getLocalRotation: (element: INode) => quat;
  getWorldTransform: (element: INode, transform?: Transform) => mat4;
  getLocalTransform: (element: INode, transform?: Transform) => mat4;
  setLocalTransform: (element: INode, transform: mat4) => void;
  resetLocalTransform: (element: INode) => void;
  getBounds: (element: INode, render?: boolean) => AABB;
  getLocalBounds: (element: INode, render?: boolean) => AABB;
  getGeometryBounds: (element: INode, render?: boolean) => AABB;
  getBoundingClientRect: (element: INode) => Rectangle;
  syncHierarchy: (element: INode) => void;
}
