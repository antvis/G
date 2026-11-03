import { Group, Rect } from '../../../packages/g-lite/src';
import { CanvasRendererPlugin } from '../../../packages/g-canvas/src/plugins/canvas-renderer/CanvasRendererPlugin';
import { DefaultRenderer } from '../../../packages/g-canvas/src/plugins/canvas-renderer/shapes/styles';
import { RectPath } from '../../../packages/g-canvas/src/plugins/path-generator/paths';

/**
 * A 2D context stub that keeps a save/restore stack like the real one
 * and records the clip depth and fill style of every fill.
 */
function createContext() {
  const state = { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1 };
  const stack: { state: typeof state; clips: number }[] = [];
  let clips = 0;
  const fills: { clips: number; fillStyle: unknown }[] = [];

  const context = new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'save') {
        return () => stack.push({ state: { ...target }, clips });
      }
      if (key === 'restore') {
        return () => {
          const saved = stack.pop();
          if (saved) {
            Object.assign(target, saved.state);
            clips = saved.clips;
          }
        };
      }
      if (key === 'clip') return () => clips++;
      if (key === 'fill') {
        return () => fills.push({ clips, fillStyle: target.fillStyle });
      }
      return () => {};
    },
  }) as unknown as CanvasRenderingContext2D;

  return { context, fills };
}

describe('canvas renderer with enableRenderingOptimization', () => {
  it('keeps the clipPath of a group for its children', () => {
    const plugin = new CanvasRendererPlugin({
      dirtyObjectNumThreshold: 500,
      dirtyObjectRatioThreshold: 0.8,
    });
    const defaultRenderer = new DefaultRenderer({} as any);
    // the parts of the plugin context the optimized path reads
    (plugin as any).context = {
      styleRendererFactory: { rect: defaultRenderer },
    };
    (plugin as any).pathGeneratorFactory = { rect: RectPath };

    const root = new Group();
    const group = new Group();
    const child = new Rect({
      style: { x: 150, y: 150, width: 200, height: 100, fill: 'red' },
    });
    const sibling = new Rect({
      style: { x: 0, y: 0, width: 50, height: 50, fill: 'red' },
    });
    group.style.clipPath = new Rect({
      style: { x: 100, y: 100, width: 200, height: 100 },
    });
    group.appendChild(child);
    root.appendChild(group);
    root.appendChild(sibling);

    const { context, fills } = createContext();
    const renderState = {
      restoreStack: [],
      prevObject: null,
      currentContext: new Map(),
    };

    // same order as the depth-first walk of the renderer
    [root, group, child, sibling].forEach((object) => {
      plugin.renderDisplayObjectOptimized(
        object,
        context,
        {} as any,
        renderState,
        {} as any,
      );
    });

    // the child is drawn inside the clip of its group
    expect(fills[0]).toEqual({ clips: 1, fillStyle: 'red' });
    // the sibling is drawn outside of it, and its fill is applied again after the restore
    expect(fills[1]).toEqual({ clips: 0, fillStyle: 'red' });
    expect(renderState.restoreStack).toEqual([]);
  });
});
