import type { Element, SHAPE } from '@antv/g';

type ElementType = SHAPE;

/**
 * host config type
 */
export type Type = ElementType;
export type Props = any;
export type Container = IInstance;
export type Instance = IInstance;
export type TextInstance = IInstance;
export type SuspenseInstance = any;
export type HydratableInstance = any;
export type PublicInstance = any;
export type HostContext = any;
export type UpdatePayload = any;
export type ChildSet = any;
export type TimeoutHandle = any;
export type NoTimeout = any;

type IInstance = Element;

/**
 * event
 */
export type GEvents = Partial<{
  onMousedown: (evt: Event) => void;
  onMouseup: (evt: Event) => void;
  onClick: (evt: Event) => void;
  onDblclick: (evt: Event) => void;
  onMousemove: (evt: Event) => void;
  onMouseover: (evt: Event) => void;
  onMouseout: (evt: Event) => void;
  onMouseenter: (evt: Event) => void;
  onMouseleave: (evt: Event) => void;
  onTouchstart: (evt: Event) => void;
  onTouchmove: (evt: Event) => void;
  onTouchend: (evt: Event) => void;
  onDragstart: (evt: Event) => void;
  onDrag: (evt: Event) => void;
  onDragend: (evt: Event) => void;
  onDragenter: (evt: Event) => void;
  onDragleave: (evt: Event) => void;
  onDragover: (evt: Event) => void;
  onDrop: (evt: Event) => void;
  onContextmenu: (evt: Event) => void;
  onMousewheel: (evt: Event) => void;
}>;
