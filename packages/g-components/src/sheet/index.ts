import { Canvas } from '@antv/g';
import { Renderer as CanvasRender } from '@antv/g-canvas';
import { Renderer as SVGRender } from '@antv/g-svg';
import { Renderer as WebGLRender } from '@antv/g-webgl';
import { Sheet } from './ui/sheet';
import type { Interaction } from './interactions';
import type { SheetData, SpreadsheetOptions } from './types';

/**
 * 组合三个区域：
 * -[x] sheet 区域
 * - toolbar
 * - sheetbar
 *
 * 维护整体的 Spreadsheet 数据
 */
export class Spreadsheet {
  /**
   * 容器
   */
  private container: HTMLElement;
  /**
   * 配置项
   */
  private options: SpreadsheetOptions;
  /**
   * 实际渲染的 G 实例
   */
  private g: Canvas;
  /**
   * 上右下左的间距，针对 sheet 区域的
   * 当前没有 toolbar 和 sheetbar 的情况下，都是 0
   */
  private padding: number[] = [0, 0, 0, 0];

  private interactions = new Map<object, Interaction>();

  /**
   * sheet 区域
   */
  public sheet: Sheet;

  constructor(container: string | HTMLElement, options: Partial<SpreadsheetOptions>) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = { ...this.getInitialOptions(), ...options };

    this.init();
  }

  /**
   * 初始化容器
   */
  private init() {
    const { width, height, renderer } = this.options;

    this.g = new Canvas({
      container: this.container,
      width,
      height,
      renderer: renderer === 'svg' ? new SVGRender() : new CanvasRender(),
      // renderer: new WebGLRender(),
    });
  }

  /**
   * 默认的配置项
   * @return
   */
  private getInitialOptions() {
    return {
      // 默认大小
      width: document.body.offsetWidth,
      height: screen.availHeight,
      // 默认值
      data: {},
      cols: {},
      rows: {},
      // 默认样式
      colHeight: 28,
      rowWidth: 100,
    };
  }

  /**
   * // todo
   * 顶部的工具栏（暂时不要）
   */
  private renderToolbar() {}

  /**
   * 中间区域基于 GUI 的 sheet 区域
   */
  private renderSheet() {
    if (!this.sheet) {
      this.sheet = new Sheet({
        style: this.getSheetAttr(),
      });

      this.container.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();
          this.sheet.onWheel(e);
        },
        { passive: false },
      );
    } else {
      this.sheet.update(this.getSheetAttr());
    }

    this.g.appendChild(this.sheet);
  }

  private getSheetAttr() {
    const { width, height, renderer, ...sheetData } = this.options;

    return {
      x: 0,
      y: 0,
      width,
      height,
      ...sheetData,
    };
  }

  /**
   * // todo
   * 底部的 sheet 栏（暂时不要）
   */
  private renderSheetbar() {}

  public render() {
    this.renderToolbar();
    this.renderSheet();
    this.renderSheetbar();

    this.interactions.forEach((i) => {
      i.init();
    });
  }

  /**
   * 修改画布大小，自动 render
   */
  public resize(width: number, height: number) {
    this.options = { ...this.options, width, height };
    this.g.resize(width, height);

    this.render();
  }

  /**
   * 修改数据，需要手动 render
   * @param data
   */
  public changeData(data: SheetData) {
    this.options = { ...this.options, ...data };
  }

  /**
   * 加载交互
   */
  public installInteraction(InteractionCtor: any) {
    // 存在则先销毁，然后创建
    if (this.interactions.has(InteractionCtor)) {
      this.interactions.get(InteractionCtor).destroy();
      this.interactions.delete(InteractionCtor);
    } else {
      this.interactions.set(InteractionCtor, new InteractionCtor(this));
    }
  }

  /**
   * 卸载交互
   */
  public uninstallInteraction(InteractionCtor: any) {
    if (this.interactions.has(InteractionCtor)) {
      this.interactions.get(InteractionCtor).destroy();
      this.interactions.delete(InteractionCtor);
    }
  }

  /**
   * 获取配置
   * @returns
   */
  public getOptions() {
    return this.options;
  }

  /**
   * 销毁清空
   */
  public destroy() {
    this.g.destroy();
    this.g = null;
    this.sheet = null;
  }
}
