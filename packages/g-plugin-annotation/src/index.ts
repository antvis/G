import type { DisplayObject } from '@antv/g-lite';
import { AbstractRendererPlugin, CSS, PropertySyntax } from '@antv/g-lite';
import { AnnotationPlugin } from './AnnotationPlugin';
import type { DrawerTool } from './constants/enum';
import type { DrawerOption, DrawerStyle } from './interface/drawer';
import { SelectablePlugin } from './SelectablePlugin';
import type { SelectableStyle, AnnotationPluginOptions } from './tokens';

export class Plugin extends AbstractRendererPlugin {
  name = 'annotation';

  constructor(private options: Partial<AnnotationPluginOptions> = {}) {
    super();
  }

  init(): void {
    const annotationPluginOptions: AnnotationPluginOptions = {
      selectableStyle: {},
      drawerStyle: {},
      isDrawingMode: true,
      arrowKeyStepLength: 4,
      enableAutoSwitchDrawingMode: false,
      enableDeleteTargetWithShortcuts: false,
      enableContinuousBrush: true,
      brushSelectionSortMode: 'directional',
      ...this.options,
    };

    this.addRenderingPlugin(new SelectablePlugin(annotationPluginOptions));
    this.addRenderingPlugin(new AnnotationPlugin(annotationPluginOptions));

    // register custom properties
    CSS.registerProperty({
      name: 'selectionFill',
      inherits: false,
      initialValue: 'black',
      interpolable: true,
      syntax: PropertySyntax.COLOR,
    });
    CSS.registerProperty({
      name: 'selectionStroke',
      inherits: false,
      initialValue: 'black',
      interpolable: true,
      syntax: PropertySyntax.COLOR,
    });
    CSS.registerProperty({
      name: 'selectionFillOpacity',
      inherits: false,
      initialValue: '1',
      interpolable: true,
      syntax: PropertySyntax.OPACITY_VALUE,
    });
    CSS.registerProperty({
      name: 'selectionStrokeOpacity',
      inherits: false,
      initialValue: '1',
      interpolable: true,
      syntax: PropertySyntax.OPACITY_VALUE,
    });
    CSS.registerProperty({
      name: 'selectionStrokeWidth',
      inherits: false,
      initialValue: '1',
      interpolable: true,
      syntax: PropertySyntax.LENGTH_PERCENTAGE,
    });
    CSS.registerProperty({
      name: 'anchorStroke',
      inherits: false,
      initialValue: 'black',
      interpolable: true,
      syntax: PropertySyntax.COLOR,
    });
    CSS.registerProperty({
      name: 'anchorFill',
      inherits: false,
      initialValue: 'black',
      interpolable: true,
      syntax: PropertySyntax.COLOR,
    });
    CSS.registerProperty({
      name: 'anchorStrokeOpacity',
      inherits: false,
      initialValue: '1',
      interpolable: true,
      syntax: PropertySyntax.OPACITY_VALUE,
    });
    CSS.registerProperty({
      name: 'anchorFillOpacity',
      inherits: false,
      initialValue: '1',
      interpolable: true,
      syntax: PropertySyntax.OPACITY_VALUE,
    });
    CSS.registerProperty({
      name: 'anchorSize',
      inherits: false,
      initialValue: '6',
      interpolable: true,
      syntax: PropertySyntax.LENGTH_PERCENTAGE,
    });
  }

  private getSelectablePlugin() {
    return this.plugins[0] as SelectablePlugin;
  }

  private getAnnotationPlugin() {
    return this.plugins[1] as AnnotationPlugin;
  }

  private getAnnotationPluginOptions() {
    return this.getAnnotationPlugin().annotationPluginOptions;
  }

  updateDrawerStyle(style: Partial<DrawerStyle>) {
    const { drawerStyle } = this.getAnnotationPluginOptions();
    Object.assign(drawerStyle, style);
  }

  updateSelectableStyle(style: Partial<SelectableStyle>) {
    const { selectableStyle } = this.getAnnotationPluginOptions();
    Object.assign(selectableStyle, style);

    this.getSelectablePlugin().updateSelectableStyle();
  }

  /**
   * show selectable UI of target displayobject
   * @see http://fabricjs.com/docs/fabric.Canvas.html#setActiveObject
   */
  selectDisplayObject(displayObject: DisplayObject) {
    this.getSelectablePlugin().selectDisplayObject(displayObject);
  }

  /**
   * hide selectable UI of target displayobject
   */
  deselectDisplayObject(displayObject: DisplayObject) {
    this.getSelectablePlugin().deselectDisplayObject(displayObject);
  }

  getSelectedDisplayObjects() {
    return this.getSelectablePlugin().getSelectedDisplayObjects();
  }

  markSelectableUIAsDirty(object: DisplayObject) {
    return this.getSelectablePlugin().markSelectableUIAsDirty(object);
  }

  addEventListener(eventName: string, fn: (...args: any[]) => void) {
    this.getAnnotationPlugin().emmiter.on(eventName, fn);
  }

  removeEventListener(eventName: string, fn: (...args: any[]) => void) {
    this.getAnnotationPlugin().emmiter.off(eventName, fn);
  }

  setDrawer(tool: DrawerTool, options?: DrawerOption) {
    this.getAnnotationPlugin().setDrawer(tool, options);
  }

  clearDrawer() {
    this.getAnnotationPlugin().clearDrawer();
  }

  /**
   * @see http://fabricjs.com/fabric-intro-part-4#free_drawing
   */
  setDrawingMode(enabled: boolean) {
    const options = this.getAnnotationPluginOptions();
    options.isDrawingMode = enabled;
  }

  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
export * from './constants/enum';
