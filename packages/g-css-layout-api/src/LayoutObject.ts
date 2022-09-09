import type { CSSStyleValue, ParsedBaseStyleProps } from '@antv/g-lite';
import { layoutEngine } from '.';
import type { LayoutFragment } from './LayoutFragment';
import type { IntrinsicSizes, MeasureFn } from './types';
import { PropertyName } from './types';

interface LayoutObjectIntrinsicSizes {
  minContentInlineSize: number;
  minContentBlockSize: number;
  maxContentInlineSize: number;
  maxContentBlockSize: number;
}

let id = 1;
export class LayoutObject {
  private id: number;

  private style: Map<string, any>;

  private dirty: boolean;

  parent?: LayoutObject;

  children: LayoutObject[];

  private internalIntrisicSizes?: LayoutObjectIntrinsicSizes;

  private computedLayout?: LayoutFragment;

  get intrisicSizes() {
    return this.internalIntrisicSizes;
  }

  get childCount() {
    return this.children.length;
  }

  private measureFn?: MeasureFn;

  constructor(style: Map<string, any> = new Map()) {
    this.id = id++;
    this.style = style;
    this.parent = undefined;
    this.children = [];
    this.dirty = false;
  }

  /**
   * set the intrinsic size of leaf node, different basic shape has different size, compsed shape has
   * @param measure measure function
   */
  setMeasure(measure: MeasureFn) {
    this.measureFn = measure;
  }

  setIntrisicSizes(intrisicSizes: IntrinsicSizes) {
    this.internalIntrisicSizes = intrisicSizes;
  }

  addChild(child: LayoutObject) {
    this.children?.push(child);
  }

  insertChild(index: number, child: LayoutObject) {
    this.children.splice(index, 0, child);
  }

  removeChild(child: LayoutObject) {
    const index = this.children?.findIndex((node) => node.id === child.id);
    this.removeChildAtIndex(index);
  }

  removeChildAtIndex(index: number) {
    this.children.splice(index, 1);
  }

  replaceChildAtIndex(index: number, child: LayoutObject) {
    this.children.splice(index, 1, child);
  }

  setStyle(property: keyof ParsedBaseStyleProps, value: CSSStyleValue) {
    this.style.set(property as string, value);
  }

  // setStyles(styles: Record<StyleProperty, StyleInputValue>) {
  //   this.style = StylePropertyMap.create({ styles }).styles;
  // }

  getStyle(...properties: string[]) {
    const returnStyle = new Map();
    properties.forEach((prop) => {
      const propertyValue = this.style.get(prop);
      if (propertyValue) {
        returnStyle.set(prop, propertyValue);
      }
    });
    return returnStyle;
  }

  getAllStyle() {
    return this.style;
  }

  markDirty() {
    this.dirty = true;
  }

  idDirty() {
    return this.dirty;
  }

  private getSize() {
    const width = this.style.get(PropertyName.WIDTH)?.value ?? 0;
    const height = this.style.get(PropertyName.HEIGHT)?.value ?? 0;
    return { width, height };
  }

  async computeLayout(): Promise<void> {
    const size = this.getSize();
    await layoutEngine.computeLayout(this, {
      availableInlineSize: size.width,
      availableBlockSize: size.height,
      fixedInlineSize: size.width,
      fixedBlockSize: size.height,
      percentageInlineSize: size.width,
      percentageBlockSize: size.height,
      data: undefined,
    });
  }

  setComputedLayout(computedLayout: LayoutFragment) {
    this.computedLayout = computedLayout;
  }

  getComputedLayout() {
    return this.computedLayout;
  }

  getAllComputedLayout() {}

  toString() {
    return `LayoutObject ${this.id}`;
  }
}
