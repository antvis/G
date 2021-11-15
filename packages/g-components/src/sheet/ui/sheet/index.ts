import { CustomElement } from '@antv/g';
// import { Scrollbar } from '@antv/gui';
import { clamp } from '@antv/util';
import { Selector } from '../../ui/selector';
import { DataSet } from '../../data-set';
import { Layout } from '../../layout';
import { Cols } from '../cols';
import { ColsAttr } from '../cols/types';
import { Rows } from '../rows';
import { RowsAttr } from '../rows/types';
import { Table } from '../table';
import { TableAttr } from '../table/types';
import type { SheetAttr, SheetOptions } from './types';

/**
 * 电子表格的主文件，本身也是一个 ui 组件
 * 看图：https://gw.alipayobjects.com/zos/antfincdn/FDXcxzIn2R/fd1d69ac-aad4-4771-89ac-db496f7fb95b.png
 */
export class Sheet extends CustomElement<SheetAttr> {
  /**
   * 组件 Sheet
   */
  public static tag = 'sheet';

  /**
   * 列头组件
   */
  public cols: Cols;
  /**
   * 行头组件
   */
  public rows: Rows;
  /**
   * 表格组件
   */
  public table: Table;
  /**
   * col 方向滚动条（横向）
   */
  // public scrollbarX: any;
  /**
   * row 方向滚动条（纵向）
   */
  // public scrollbarY: any;
  /**
   * 圈选的 ui
   */
  public selector: Selector;

  /**
   * 布局模块
   */
  public layout: Layout;
  /**
   * 数据模块
   */
  public dataSet: DataSet;

  /**
   * x 方向偏移
   */
  private offsetX: number = 0;
  /**
   * y 方向偏移
   */
  private offsetY: number = 0;

  constructor(options: SheetOptions) {
    super(options);
    this.init();
  }

  /**
   * 设置偏移量（对开发者暴漏的 API）
   * @param offsetX
   * @param offsetY
   */
  public setOffset(offsetX: number, offsetY: number) {
    const { width, height } = this.table.attributes;
    // 防止超出
    this.offsetX = clamp(offsetX, 0, width);
    this.offsetY = clamp(offsetY, 0, height);

    this.cols.setOffset(this.offsetX);
    this.rows.setOffset(this.offsetY);
    this.table.setOffset(this.offsetX, this.offsetY);
    // this.scrollbarX.setValue(this.offsetX / width);
    // this.scrollbarY.setValue(this.offsetY / height);
    // 更新 selector 的位置
    if (this.selector) this.selector.update(this.getSelectorAttr());
  }

  /**
   * 初始化
   */
  public init(): void {
    this.update();
  }

  /**
   * 组件的更新
   */
  public update(attr: Partial<SheetAttr> = {}) {
    this.attr(attr);

    this.updateDataSet();
    this.updateLayout();
    this.updateUI();
  }

  /**
   * 更新数据集
   */
  private updateDataSet() {
    const { data } = this.attributes;
    if (!this.dataSet) {
      this.dataSet = new DataSet({ data });
    }

    this.dataSet.update({ data });

    this.dataSet.training();
  }

  /**
   * 更新布局
   */
  private updateLayout() {
    const { width, height, cols, rows } = this.attributes;
    if (!this.layout) {
      this.layout = new Layout({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        cols,
        rows,
      });
    }

    // 更新到真实的配置
    const [t, r, b, l] = this.getPadding();
    this.layout.update({
      x: 0,
      y: 0, // 位置相对于 Table 位置，所以都为 0，0
      width: width - l - r, // 行头的大小，滚动条的大小
      height: height - t - b, // 列头的大小，滚动条的大小
      cols,
      rows,
    });

    this.layout.run();
  }

  /**
   * 更新 UI
   */
  private updateUI() {
    // 不存在则创建 cols、rows、table、scrollbarX、scrollbarY
    // 存在，则更新
    if (!this.cols) {
      this.cols = new Cols({ name: 'cols', style: this.getColsAttr() });
      this.appendChild(this.cols);
    } else {
      this.cols.update(this.getColsAttr());
    }

    if (!this.rows) {
      this.rows = new Rows({ name: 'rows', style: this.getRowsAttr() });
      this.appendChild(this.rows);
    } else {
      this.rows.update(this.getRowsAttr());
    }

    if (!this.table) {
      this.table = new Table({ name: 'table', style: this.getTableAttr() });

      this.appendChild(this.table);
    } else {
      this.table.update(this.getTableAttr());
    }

    // if (!this.scrollbarX) {
    //   this.scrollbarX = new Scrollbar({ style: this.getScrollbarXAttr() });
    //   this.scrollbarX.addEventListener('valueChanged', this.onScrollX);

    //   this.appendChild(this.scrollbarX);
    // } else {
    //   this.scrollbarX.update(this.getScrollbarXAttr());
    // }

    // if (!this.scrollbarY) {
    //   this.scrollbarY = new Scrollbar({ style: this.getScrollbarYAttr() });
    //   this.scrollbarY.addEventListener('valueChanged', this.onScrollY);

    //   this.appendChild(this.scrollbarY);
    // } else {
    //   this.scrollbarY.update(this.getScrollbarYAttr());
    // }

    if (!this.selector) {
      this.selector = new Selector({ name: 'selector', style: this.getSelectorAttr() });
      this.appendChild(this.selector);
      this.selector.backgroundShape.interactive = false;
    } else {
      this.selector.update(this.getSelectorAttr());
    }
  }

  private onScrollX = (e) => {
    const v = e.detail.value;
    // this.setOffset(v * this.scrollbarX.attr('width'), this.offsetY);
  };

  private onScrollY = (e) => {
    const v = e.detail.value;
    // this.setOffset(this.offsetX, v * this.scrollbarY.attr('height'));
  };

  onWheel = (e) => {
    // @ts-ignore
    const { deltaX, deltaY } = e;
    this.setOffset(this.offsetX + deltaX, this.offsetY + deltaY);
  };

  /**
   * 获取 Table 外围的 padding 值
   * [colHeight, scrollbarYWdith, scrollbarXHeight, rowWidth]
   */
  private getPadding() {
    const { colHeight, rowWidth } = this.attributes;
    return [
      colHeight,
      5, // 滚动条宽高
      5,
      rowWidth,
    ];
  }

  private getColsAttr(): ColsAttr {
    const { x, y, width, height } = this.attributes;
    const [t, r, b, l] = this.getPadding();
    return {
      x: l,
      y: 0,
      width: width - l - r,
      height: t,
      offset: this.offsetX,
      widths: this.layout.getWidths(),
    };
  }

  private getRowsAttr(): RowsAttr {
    const { x, y, width, height } = this.attributes;
    const [t, r, b, l] = this.getPadding();
    return {
      x: 0,
      y: t,
      width: l,
      height: height - t - b,
      offset: this.offsetY,
      heights: this.layout.getHeights(),
    };
  }

  private getTableAttr(): TableAttr {
    const { x, y, width, height } = this.attributes;
    const [t, r, b, l] = this.getPadding();

    return {
      x: l,
      y: t,
      width: width - l - r,
      height: height - t - b,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      layout: this.layout,
      dataSet: this.dataSet,
    };
  }

  private getScrollbarXAttr() {
    const { x, y, width, height } = this.attributes;
    const [t, r, b, l] = this.getPadding();

    return {
      x: l,
      y: height - b,
      orient: 'horizontal' as any,
      value: 0,
      width: width - l - r,
      height: 5,
      thumbLen: 100,
      padding: 0,
      trackStyle: {
        default: { lineWidth: 1, stroke: '#cecece', shadowColor: '#c0c0c0', shadowBlur: 10 },
      },
      thumbStyle: {
        default: { fill: '#000' },
      },
      isRound: true,
    };
  }

  private getScrollbarYAttr() {
    const { x, y, width, height } = this.attributes;
    const [t, r, b, l] = this.getPadding();

    return {
      x: width - r,
      y: t,
      orient: 'vertical' as any,
      value: 0,
      width: 5,
      height: height - t - b,
      thumbLen: 100,
      padding: 0,
      trackStyle: {
        default: { lineWidth: 1, stroke: '#cecece', shadowColor: '#c0c0c0', shadowBlur: 10 },
      },
      thumbStyle: {
        default: { fill: '#000' },
      },
      isRound: true,
    };
  }

  private getSelectorAttr() {
    const { x, y, width, height, selection } = this.attributes;
    const [t, r, b, l] = this.getPadding();

    const bbox = this.layout.getSelectionBBox(selection);

    if (!bbox) {
      return { x: 0, y: 0, width: 0, height: 0, visibility: 'hidden' };
    }

    return {
      x: l + bbox[0] - this.offsetX,
      y: t + bbox[1] - this.offsetY,
      width: bbox[2],
      height: bbox[3],
      visibility: 'visible',
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
    this.cols.destroy();
    this.cols = null;

    this.rows.destroy();
    this.rows = null;

    this.table.destroy();
    this.table = null;

    this.removeChildren(true);
    super.destroy();
  }
}
