import { Shape } from '../../../packages/g-lite/src';
import { OptimizedDefaultRenderer } from '../../../packages/g-canvas/src/plugins/canvas-renderer/shapes/styles/OptimizedDefault';
import { TextRenderer } from '../../../packages/g-canvas/src/plugins/canvas-renderer/shapes/styles/Text';

describe('optimized canvas style cache after text rendering', () => {
  it('reapplies a path lineWidth after text changed the context directly', () => {
    const context = {
      lineWidth: 3,
      setLineDash: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
    const renderState = {
      prevObject: null,
      currentContext: new Map([['lineWidth', 3]]),
    } as any;
    const textRenderer = new TextRenderer({} as any);
    jest
      .spyOn(textRenderer, 'render')
      .mockImplementation((ctx: CanvasRenderingContext2D) => {
        ctx.lineWidth = 1;
      });

    textRenderer.drawToContext(
      context,
      {
        parsedStyle: {},
        ownerDocument: { defaultView: { context: {} } },
      } as any,
      renderState,
      {} as any,
      {} as any,
    );

    const path = {
      nodeName: Shape.PATH,
      parsedStyle: {
        opacity: 1,
        blend: 'source-over',
        fill: null,
        stroke: '#000',
        lineWidth: 3,
        lineDash: [],
        lineDashOffset: 0,
        lineCap: 'butt',
        lineJoin: 'miter',
        miterLimit: 10,
      },
      attributes: { stroke: '#000' },
    } as any;

    new OptimizedDefaultRenderer({} as any).applyStyleToContext(
      context,
      path,
      true,
      renderState,
    );

    expect(context.lineWidth).toBe(3);
  });
});
