import type {
  DisplayObject,
  FederatedEvent,
  PickingResult,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { ElementEvent, Rectangle } from '@antv/g-lite';
import { clamp } from '@antv/util';
import {
  BlendFactor,
  BlendMode,
  setAttachmentStateSimple,
  TransparentBlack,
} from '@antv/g-device-api';
import type { PickingIdGenerator } from './PickingIdGenerator';
import type { RenderHelper } from './render';
import {
  AntialiasingMode,
  makeAttachmentClearDescriptor,
  makeBackbufferDescSimple,
  opaqueWhiteFullClearRenderPassDescriptor,
  RGAttachmentSlot,
} from './render';
import type { BatchManager } from './renderer';
import type { RenderGraphPlugin } from './RenderGraphPlugin';
import { SceneUniform, SceneUniformBufferIndex } from './RenderGraphPlugin';
import { Renderable3D } from './components/Renderable3D';

/**
 * max depth when doing multi-layer picking
 */
const MAX_PICKING_DEPTH = 100;

/**
 * Use color-based picking in GPU
 */
export class PickingPlugin implements RenderingPlugin {
  static tag = 'WebGLPicker';

  private context: RenderingPluginContext;

  constructor(
    private renderHelper: RenderHelper,
    private renderGraphPlugin: RenderGraphPlugin,
    private pickingIdGenerator: PickingIdGenerator,
    private batchManager: BatchManager,
  ) {}

  apply(context: RenderingPluginContext) {
    this.context = context;
    const { renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // @ts-ignore
      if (!object.renderable3D) {
        // @ts-ignore
        object.renderable3D = new Renderable3D();
      }

      // @ts-ignore
      const { renderable3D } = object;
      // generate picking id for later use
      const pickingId = this.pickingIdGenerator.getId(object);
      renderable3D.pickingId = pickingId;
      renderable3D.encodedPickingColor =
        this.pickingIdGenerator.encodePickingColor(pickingId);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // @ts-ignore
      const { renderable3D } = object;
      if (renderable3D) {
        this.pickingIdGenerator.deleteById(renderable3D.pickingId);
      }
    };

    renderingService.hooks.init.tap(PickingPlugin.tag, () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
    });

    renderingService.hooks.destroy.tap(PickingPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.pickingIdGenerator.reset();
    });

    /**
     * Sync version is not implemented.
     */
    renderingService.hooks.pickSync.tap(
      PickingPlugin.tag,
      (result: PickingResult) => {
        return this.pick(result);
      },
    );

    renderingService.hooks.pick.tapPromise(
      PickingPlugin.tag,
      async (result: PickingResult) => {
        return this.pick(result);
      },
    );
  }

  private pick(result: PickingResult) {
    const { topmost, position } = result;

    // use viewportX/Y
    const { viewportX: x, viewportY: y } = position;
    const dpr = this.context.contextService.getDPR();
    const width = this.context.config.width * dpr;
    const height = this.context.config.height * dpr;

    const xInDevicePixel = x * dpr;
    const yInDevicePixel = y * dpr;

    if (
      !this.renderHelper.renderGraph ||
      xInDevicePixel > width ||
      xInDevicePixel < 0 ||
      yInDevicePixel > height ||
      yInDevicePixel < 0
    ) {
      result.picked = [];
      return result;
    }

    // implements multi-layer picking
    // @see https://github.com/antvis/g/issues/948
    const pickedDisplayObjects = this.pickByRectangleInDepth(
      new Rectangle(
        clamp(Math.round(xInDevicePixel), 0, width - 1),
        clamp(Math.round(yInDevicePixel), 0, height - 1),
        1,
        1,
      ),
      topmost ? 1 : MAX_PICKING_DEPTH,
    );

    result.picked = pickedDisplayObjects;
    return result;
  }

  private pickByRectangleInDepth(
    rect: Rectangle,
    depth = MAX_PICKING_DEPTH,
  ): DisplayObject[] {
    let picked = null;
    let counter = 1;
    const targets = [];

    do {
      picked = this.pickByRectangle(rect, picked);

      if (picked) {
        counter++;
        targets.push(picked);
      } else {
        break;
      }
    } while (picked && counter <= depth);

    if (depth > 1) {
      // restore encoded picking color
      this.restorePickingColor(targets);
    }

    return targets;
  }

  private restorePickingColor(displayObjects: DisplayObject[]) {
    displayObjects.forEach((picked) => {
      this.batchManager.updateAttribute(picked, 'pointerEvents', true, true);
    });
  }

  /**
   * return displayobjects in target rectangle
   */
  private pickByRectangle(
    rect: Rectangle,
    picked: DisplayObject,
  ): DisplayObject | null {
    const device = this.renderGraphPlugin.getDevice();
    const renderLists = this.renderGraphPlugin.getRenderLists();

    const { renderInstManager } = this.renderHelper;
    const builder = this.renderHelper.renderGraph.newGraphBuilder();
    const clearColor = TransparentBlack;
    const { camera } = this.context;

    // retrieve at each frame since canvas may resize
    const { x, y, width, height } = rect;

    // use a small picking area(like 1x1) instead of a fullscreen rt
    const renderInput = {
      backbufferWidth: width,
      backbufferHeight: height,
      antialiasingMode: AntialiasingMode.None,
    };
    const mainPickingDesc = makeBackbufferDescSimple(
      RGAttachmentSlot.Color0,
      renderInput,
      makeAttachmentClearDescriptor(clearColor),
    );
    const pickingColorTargetID = builder.createRenderTargetID(
      mainPickingDesc,
      'Picking Color',
    );
    // create main Depth RT
    const mainDepthDesc = makeBackbufferDescSimple(
      RGAttachmentSlot.DepthStencil,
      renderInput,
      opaqueWhiteFullClearRenderPassDescriptor,
    );
    const mainDepthTargetID = builder.createRenderTargetID(
      mainDepthDesc,
      'Picking Depth',
    );

    // account for current view offset
    const currentView = { ...camera.getView() };

    // prevent unused RTs like main color being destroyed
    this.renderHelper.renderGraph.renderTargetDeadPool.forEach((rt) => {
      rt.age = -1;
    });

    // picking pass
    let target: DisplayObject;
    builder.pushPass((pass) => {
      pass.setDebugName('Picking Pass');
      pass.attachRenderTargetID(RGAttachmentSlot.Color0, pickingColorTargetID);
      pass.attachRenderTargetID(
        RGAttachmentSlot.DepthStencil,
        mainDepthTargetID,
      );
      pass.exec((passRenderer) => {
        renderLists.picking.drawOnPassRenderer(
          renderInstManager.renderCache,
          passRenderer,
        );
      });
      pass.post((scope) => {
        const texture = scope.getRenderTargetTexture(RGAttachmentSlot.Color0);

        const readback = device.createReadback();

        // restore previous view
        if (currentView && currentView.enabled) {
          camera.setViewOffset(
            currentView.fullWidth,
            currentView.fullHeight,
            currentView.offsetX,
            currentView.offsetY,
            currentView.width,
            currentView.height,
          );
        } else {
          camera.clearViewOffset();
        }

        camera.setEnableUpdate(true);

        let pickedColors: Uint8Array;
        try {
          pickedColors = readback.readTextureSync(
            texture,
            0,
            0,
            width,
            height,
            new Uint8Array(width * height * 4),
          ) as Uint8Array;
        } catch {}

        let pickedFeatureIdx = -1;

        if (
          pickedColors &&
          (pickedColors[0] !== 0 ||
            pickedColors[1] !== 0 ||
            pickedColors[2] !== 0)
        ) {
          pickedFeatureIdx =
            this.pickingIdGenerator.decodePickingColor(pickedColors);
        }

        if (pickedFeatureIdx > -1) {
          const pickedDisplayObject =
            this.pickingIdGenerator.getById(pickedFeatureIdx);

          if (
            pickedDisplayObject &&
            pickedDisplayObject.isVisible() &&
            pickedDisplayObject.isInteractive()
          ) {
            target = pickedDisplayObject;
          }
        }
        readback.destroy();
      });
    });

    // Push our outer template, which contains the dynamic UBO bindings...
    const template = this.renderHelper.pushTemplateRenderInst();
    // SceneParams: binding = 0, ObjectParams: binding = 1
    template.setBindingLayout({ numUniformBuffers: 2, numSamplers: 0 });
    template.setMegaStateFlags(
      setAttachmentStateSimple(
        {
          depthWrite: true,
        },
        {
          rgbBlendMode: BlendMode.ADD,
          rgbBlendSrcFactor: BlendFactor.ONE,
          rgbBlendDstFactor: BlendFactor.ZERO,
          alphaBlendMode: BlendMode.ADD,
          alphaBlendSrcFactor: BlendFactor.ONE,
          alphaBlendDstFactor: BlendFactor.ZERO,
        },
      ),
    );

    // Update Scene Params
    const { width: canvasWidth, height: canvasHeight } = this.context.config;
    const dpr = this.context.contextService.getDPR();

    camera.setEnableUpdate(false);
    camera.setViewOffset(
      canvasWidth * dpr,
      canvasHeight * dpr,
      x,
      // fix https://github.com/antvis/G/issues/1747
      canvasHeight * dpr - y,
      width,
      height,
    );

    template.setUniforms(SceneUniformBufferIndex, [
      {
        name: SceneUniform.PROJECTION_MATRIX,
        value: camera.getPerspective(),
      },
      {
        name: SceneUniform.VIEW_MATRIX,
        value: camera.getViewTransform(),
      },
      {
        name: SceneUniform.CAMERA_POSITION,
        value: camera.getPosition(),
      },
      {
        name: SceneUniform.DEVICE_PIXEL_RATIO,
        value: this.context.contextService.getDPR(),
      },
      {
        name: SceneUniform.VIEWPORT,
        value: [width, height],
      },
      {
        name: SceneUniform.IS_ORTHO,
        value: camera.isOrtho() ? 1 : 0,
      },
      {
        name: SceneUniform.IS_PICKING,
        value: 1,
      },
    ]);

    if (picked) {
      this.batchManager.updateAttribute(picked, 'pointerEvents', false, true);
    }
    this.batchManager.render(renderLists.picking, true);

    renderInstManager.popTemplateRenderInst();

    this.renderHelper.prepareToRender();
    this.renderHelper.renderGraph.execute();

    renderInstManager.resetRenderInsts();

    return target;
  }
}
