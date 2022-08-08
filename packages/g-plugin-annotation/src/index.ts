import type { DisplayObject } from '@antv/g';
import { AbstractRendererPlugin, CSS, Module, PropertySyntax } from '@antv/g';
import { AnnotationPlugin } from './AnnotationPlugin';
import type { DrawerTool } from './constants/enum';
import type { DrawerOption } from './interface/drawer';
import { SelectablePlugin } from './SelectablePlugin';
import type { SelectableStyle } from './tokens';
import { AnnotationPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(AnnotationPlugin);
  register(SelectablePlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'annotation';

  constructor(private options: Partial<AnnotationPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(AnnotationPluginOptions, {
      useValue: {
        selectableStyle: {},
        ...this.options,
      },
    });
    this.container.load(containerModule, true);

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

  updateSelectableStyle(style: Partial<SelectableStyle>) {
    const { selectableStyle } =
      this.container.get<AnnotationPluginOptions>(AnnotationPluginOptions);
    Object.assign(selectableStyle, style);

    this.container.get(SelectablePlugin).updateSelectableStyle();
  }

  /**
   * @see http://fabricjs.com/docs/fabric.Canvas.html#setActiveObject
   */
  selectDisplayObject(displayObject: DisplayObject) {}

  unselectDisplayObject(displayObject: DisplayObject) {}

  getSelectedDisplayObjects() {
    this.container.get(SelectablePlugin).getSelectedDisplayObjects();
  }

  addEventListener(eventName: string, fn: (...args: any[]) => void) {
    this.container.get(AnnotationPlugin).emmiter.on(eventName, fn);
  }

  removeEventListener(eventName: string, fn: (...args: any[]) => void) {
    this.container.get(AnnotationPlugin).emmiter.off(eventName, fn);
  }

  setDrawer(tool: DrawerTool, options?: DrawerOption) {
    this.container.get(AnnotationPlugin).setDrawer(tool, options);
  }

  destroy(): void {
    this.container.remove(AnnotationPluginOptions);
    this.container.unload(containerModule);
  }
}
export * from './constants/enum';
