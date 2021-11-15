import { CustomElement, Rect, Text } from '@antv/g';
import type { CellAttr, CellOptions } from './types';

/**
 * 电子表格的正文单元格，其实是一个富文本显示的组件，包含有：
 * - x y width height
 * 看图：https://gw.alipayobjects.com/zos/antfincdn/UJu6oIZuOt/11aa7ffe-cac7-4230-a0dc-f7f48c4cc303.png
 */
export class Cell extends CustomElement<CellAttr> {
  /**
   * 组件 Cell
   */
  public static tag = 'cell';
  /**
   * 背景 shape
   */
  public backgroundShape;
  /**
   * 文本 shape
   */
  public textShape;

  constructor(options: CellOptions) {
    super(options);

    this.init();
  }

  /**
   * 获取行索引
   */
  public getRow() {
    return this.attributes.row;
  }

  /**
   * 获取列索引
   */
  public getCol() {
    return this.attributes.col;
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
  public update(attr: Partial<CellAttr> = {}) {
    this.attr(attr);

    // 1. 背景
    if (!this.backgroundShape) {
      this.backgroundShape = new Rect({
        name: 'cell-background',
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
    const { width, height } = this.attributes;
    this.backgroundShape.attr({
      // 位置，相对于容器的
      x: 0,
      y: 0,
      width,
      height,
      // 掩饰
      fill: '#fff',
      cursor: 'cell',
      stroke: '#000',
      lineWidth: 0.1,
    });
    this.textShape.attr({
      x: width / 2,
      y: height / 2,
      text: this.getText(),
    });
    this.getText();
  }

  /**
   * 获取单元格的内容文本
   * @returns
   */
  private getText() {
    const { text, formula } = this.attributes;

    // todo 处理公式的能力
    return text;
  }

  /**
   * 销毁
   */
  public destroy() {
    this.removeChildren(true);
    super.destroy();
  }
}
