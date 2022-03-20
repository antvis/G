import type { Element, InteractivePointerEvent, Shape } from '@antv/g';

type ElementType = Shape;

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
  // pointer
  onPointerdown: (evt: InteractivePointerEvent) => void;
  onPointerup: (evt: InteractivePointerEvent) => void;
  onPointerupoutside: (evt: InteractivePointerEvent) => void;
  onPointertap: (evt: InteractivePointerEvent) => void;
  onPointerover: (evt: InteractivePointerEvent) => void;
  onPointerenter: (evt: InteractivePointerEvent) => void;
  onPointerleave: (evt: InteractivePointerEvent) => void;
  onPointerout: (evt: InteractivePointerEvent) => void;

  // mouse
  onMousedown: (evt: InteractivePointerEvent) => void;
  onRightdown: (evt: InteractivePointerEvent) => void;
  onMouseup: (evt: InteractivePointerEvent) => void;
  onMouseupoutside: (evt: InteractivePointerEvent) => void;
  onClick: (evt: InteractivePointerEvent) => void;
  onMousemove: (evt: InteractivePointerEvent) => void;
  onMouseover: (evt: InteractivePointerEvent) => void;
  onMouseout: (evt: InteractivePointerEvent) => void;
  onMouseenter: (evt: InteractivePointerEvent) => void;
  onMouseleave: (evt: InteractivePointerEvent) => void;

  // touch
  onTouchstart: (evt: InteractivePointerEvent) => void;
  onTouchend: (evt: InteractivePointerEvent) => void;
  onTouchendoutside: (evt: InteractivePointerEvent) => void;
  onTouchmove: (evt: InteractivePointerEvent) => void;
  onTap: (evt: InteractivePointerEvent) => void;

  // wheel
  onWheel: (evt: InteractivePointerEvent) => void;
}>;
