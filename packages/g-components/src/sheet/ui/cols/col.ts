import { CustomElement, Rect, Text } from '@antv/g';
import { toString } from '../../helper';
import type { ColAttr, ColOptions } from './types';

/**
 * 一个单独的列头单元格（和 Row 基本一摸一样，不同的就是 getText 逻辑不一样
 */
export class Col extends CustomElement<ColAttr> {
  /**
   * 组件 Col
   */
  public static tag = 'col';
  /**
   * 背景 shape
   */
  public backgroundShape;
  /**
   * 文本 shape
   */
  public textShape;

  constructor(options: ColOptions) {
    super(options);

    this.init();
  }

  /**
   * 获取元素的 id
   */
  public getId() {
    return `${this.attributes.index}`;
  }

  /**
   * 初始化：根据配置创建
   */
  public init() {
    this.update();
  }

  /**
   * 更新内容
   */
  public update(attr: Partial<ColAttr> = {}) {
    this.attr(attr);

    // 1. 背景
    if (!this.backgroundShape) {
      this.backgroundShape = new Rect({
        name: 'background',
      });

      this.appendChild(this.backgroundShape);
    }

    // 2. 文本内容
    if (!this.textShape) {
      this.textShape = new Text({
        name: 'text',
        style: {
          text: '',
          textAlign: 'center',
          textBaseline: 'middle',
          fontSize: 12,
        },
      });

      this.appendChild(this.textShape);
    }

    // 3. 更新配置
    const { x, y, width, height, textStyle } = this.attributes;
    this.backgroundShape.attr({
      x,
      y,
      width,
      height,
    });
    this.textShape.attr({
      x: width / 2,
      y: height / 2,
      text: this.getText(),
      ...textStyle,
    });
    this.getText();
  }

  /**
   * 获取单元格的内容文本
   * @returns
   */
  private getText() {
    const { index } = this.attributes;

    return toString(index + 1);
  }

  /**
   * 销毁
   */
  public destroy() {
    this.removeChildren(true);
    super.destroy();
  }
}
