import type { BaseStyleProps, DisplayObjectConfig, IChildNode } from '@antv/g-lite';
import { DisplayObject } from '@antv/g-lite';
import type { vec2, vec3 } from 'gl-matrix';

// @ts-ignore
DisplayObject.prototype.getCount = function () {
  return this.childElementCount;
};

// @ts-ignore
DisplayObject.prototype.getParent = function (): DisplayObject | null {
  return this.parentElement as DisplayObject;
};

// @ts-ignore
DisplayObject.prototype.getChildren = function (): DisplayObject[] {
  return this.children as DisplayObject[];
};

// @ts-ignore
DisplayObject.prototype.getFirst = function (): DisplayObject | null {
  return this.firstElementChild as DisplayObject;
};

// @ts-ignore
DisplayObject.prototype.getLast = function (): DisplayObject | null {
  return this.lastElementChild as DisplayObject;
};

// @ts-ignore
DisplayObject.prototype.getChildByIndex = function (index: number): DisplayObject | null {
  return (this.children[index] as DisplayObject) || null;
};

// @ts-ignore
DisplayObject.prototype.add = function <T extends IChildNode>(child: T, index?: number): T {
  return this.appendChild(child, index);
};

// @ts-ignore
DisplayObject.prototype.setClip = function (clipPath: DisplayObject | null) {
  this.style.clipPath = clipPath;
};

// @ts-ignore
DisplayObject.prototype.getClip = function () {
  return this.style.clipPath || null;
};

// @ts-ignore
DisplayObject.prototype.set = function <
  StyleProps extends BaseStyleProps,
  Key extends keyof DisplayObjectConfig<StyleProps>,
>(name: Key, value: DisplayObjectConfig<StyleProps>[Key]) {
  this.config[name] = value;
};

// @ts-ignore
DisplayObject.prototype.get = function <StyleProps extends BaseStyleProps>(
  name: keyof DisplayObjectConfig<StyleProps>,
) {
  return this.config[name];
};

// @ts-ignore
DisplayObject.prototype.show = function () {
  this.style.visibility = 'visible';
};

// @ts-ignore
DisplayObject.prototype.hide = function () {
  this.style.visibility = 'hidden';
};

// @ts-ignore
DisplayObject.prototype.moveTo = function (
  position: vec3 | vec2 | number,
  y: number = 0,
  z: number = 0,
) {
  (this as unknown as DisplayObject).setPosition(position, y, z);
  return this;
};

// @ts-ignore
DisplayObject.prototype.move = function (
  position: vec3 | vec2 | number,
  y: number = 0,
  z: number = 0,
) {
  (this as unknown as DisplayObject).setPosition(position, y, z);
  return this;
};

// @ts-ignore
DisplayObject.prototype.setZIndex = function (zIndex: number) {
  this.style.zIndex = zIndex;
  return this;
};
