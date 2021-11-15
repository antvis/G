import { Rect, CustomElement } from '@antv/g';
import { DEFAULT_COLOR } from '../../theme';
import type { SelectorAttr, SelectorOptions } from './types';

/**
 * 圈选的标记框
 * https://gw.alipayobjects.com/zos/antfincdn/WUdfeLPD0d/971a545c-e34d-4a48-a739-99335f9fd846.png
 */
export class Selector extends CustomElement<SelectorAttr> {
  /**
   * 组件 Selector
   */
  public static tag = 'selector';
  /**
   * 背景元素
   */
  public backgroundShape: Rect;
  /**
   * 右小角小图标 组件
   */
  public iconShape!: Rect;

  constructor(options: SelectorOptions) {
    super(options);

    this.init();
  }

  public init(): void {
    this.update();
  }

  /**
   * 组件的更新
   */
  public update(attr?: Partial<SelectorAttr>) {
    this.attr(attr);

    // 不存在则创建，然后更新
    if (!this.backgroundShape) {
      this.backgroundShape = new Rect({
        name: 'selector-background',
        style: this.getBackgroundAttr(),
      });

      this.appendChild(this.backgroundShape);
    } else {
      this.backgroundShape.attr(this.getBackgroundAttr());
    }

    if (!this.iconShape) {
      this.iconShape = new Rect({
        name: 'selector-icon',
        style: this.getIconAttr(),
      });
      this.appendChild(this.iconShape);
    } else {
      this.iconShape.attr(this.getIconAttr());
    }

    this.backgroundShape.attr({});
  }

  private getBackgroundAttr() {
    const { width, height } = this.attributes;

    return {
      x: 0,
      y: 0,
      width,
      height,
      fill: DEFAULT_COLOR,
      stroke: DEFAULT_COLOR,
      lineWidth: 2,
      fillOpacity: 0.1,
    };
  }

  private getIconAttr() {
    const { width, height } = this.attributes;
    return {
      // 写死固定为 6px 的
      x: width - 3,
      y: height - 3,
      width: 6,
      height: 6,
      lineWidth: 2,
      stroke: '#fff',
      // cursor: 'crosshair',
      fill: DEFAULT_COLOR,
    };
  }

  /**
   * 组件的清理
   */
  public clear() {}

  /**
   * 组件的销毁
   */
  public destroy() {
    this.removeChildren(true);
    super.destroy();
  }
}
