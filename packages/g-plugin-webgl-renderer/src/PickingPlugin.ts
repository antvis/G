import type {
  RenderingService,
  RenderingPlugin,
  PickingResult,
  FederatedEvent,
  DisplayObject,
} from '@antv/g';
import { RenderingContext, ElementEvent, DefaultCamera, Camera } from '@antv/g';
import {
  RenderingPluginContribution,
  SceneGraphService,
  Rectangle,
  ContextService,
  CanvasConfig,
} from '@antv/g';
import { clamp } from 'lodash-es';
import { inject, singleton } from 'mana-syringe';
import { PickingIdGenerator } from './PickingIdGenerator';
import { BlendFactor, BlendMode } from './platform';
import { setAttachmentStateSimple } from './platform/utils';
import { RenderHelper, TemporalTexture } from './render';
import { RGAttachmentSlot } from './render/interfaces';
import {
  AntialiasingMode,
  makeAttachmentClearDescriptor,
  makeBackbufferDescSimple,
  opaqueWhiteFullClearRenderPassDescriptor,
} from './render/RenderGraphHelpers';
import { BatchManager } from './renderer';
import { RenderGraphPlugin, SceneUniform, SceneUniformBufferIndex } from './RenderGraphPlugin';
import { TransparentWhite } from './utils/color';

/**
 * max depth when doing multi-layer picking
 */
const MAX_PICKING_DEPTH = 100;

/**
 * Use color-based picking in GPU
 */
@singleton({ contrib: RenderingPluginContribution })
export class PickingPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(RenderHelper)
  private renderHelper: RenderHelper;

  @inject(RenderGraphPlugin)
  private renderGraphPlugin: RenderGraphPlugin;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(BatchManager)
  private batchManager: BatchManager;

  /**
   * used for reading pixels when picking
   */
  // private pickingTexture: TemporalTexture;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // @ts-ignore
      const renderable3D = object.renderable3D;
      if (renderable3D) {
        // generate picking id for later use
        const pickingId = this.pickingIdGenerator.getId(object);
        renderable3D.pickingId = pickingId;
        renderable3D.encodedPickingColor = this.pickingIdGenerator.encodePickingColor(pickingId);
      }
    };

    renderingService.hooks.init.tapPromise(async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
    });

    renderingService.hooks.destroy.tap(() => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
    });

    renderingService.hooks.pick.tapPromise(async (result: PickingResult) => {
      const { topmost, position } = result;

      // use viewportX/Y
      const { viewportX: x, viewportY: y } = position;
      const dpr = this.contextService.getDPR();
      const width = this.canvasConfig.width * dpr;
      const height = this.canvasConfig.height * dpr;

      const xInDevicePixel = x * dpr;
      const yInDevicePixel = y * dpr;

      if (
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
      const pickedDisplayObjects = await this.pickByRectangleInDepth(
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
    });
  }

  private async pickByRectangleInDepth(
    rect: Rectangle,
    depth = MAX_PICKING_DEPTH,
  ): Promise<DisplayObject[]> {
    let picked = null;
    let counter = 1;
    const targets = [];

    do {
      picked = await this.pickByRectangle(rect, picked);

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
  private async pickByRectangle(
    rect: Rectangle,
    picked: DisplayObject,
  ): Promise<DisplayObject | null> {
    const device = this.renderGraphPlugin.getDevice();
    const renderLists = this.renderGraphPlugin.getRenderLists();

    const renderInstManager = this.renderHelper.renderInstManager;
    const builder = this.renderHelper.renderGraph.newGraphBuilder();
    const clearColor = TransparentWhite;

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
    const pickingColorTargetID = builder.createRenderTargetID(mainPickingDesc, 'Picking Color');
    // create main Depth RT
    const mainDepthDesc = makeBackbufferDescSimple(
      RGAttachmentSlot.DepthStencil,
      renderInput,
      opaqueWhiteFullClearRenderPassDescriptor,
    );
    const mainDepthTargetID = builder.createRenderTargetID(mainDepthDesc, 'Picking Depth');

    const pickingTemporalTexture = new TemporalTexture();
    pickingTemporalTexture.setDescription(device, mainPickingDesc);

    // picking pass
    builder.pushPass((pass) => {
      pass.setDebugName('Picking Pass');
      pass.attachRenderTargetID(RGAttachmentSlot.Color0, pickingColorTargetID);
      pass.attachRenderTargetID(RGAttachmentSlot.DepthStencil, mainDepthTargetID);
      pass.exec((passRenderer) => {
        renderLists.picking.drawOnPassRenderer(renderInstManager.renderCache, passRenderer);
      });
    });
    // save picking texture
    builder.resolveRenderTargetToExternalTexture(
      pickingColorTargetID,
      pickingTemporalTexture.getTextureForResolving(),
    );

    // Push our outer template, which contains the dynamic UBO bindings...
    const template = this.renderHelper.pushTemplateRenderInst();
    // SceneParams: binding = 0, ObjectParams: binding = 1
    template.setBindingLayouts([{ numUniformBuffers: 2, numSamplers: 0 }]);
    template.setMegaStateFlags(
      setAttachmentStateSimple(
        {
          depthWrite: true,
        },
        {
          rgbBlendMode: BlendMode.Add,
          rgbBlendSrcFactor: BlendFactor.One,
          rgbBlendDstFactor: BlendFactor.Zero,
          alphaBlendMode: BlendMode.Add,
          alphaBlendSrcFactor: BlendFactor.One,
          alphaBlendDstFactor: BlendFactor.Zero,
        },
      ),
    );

    // Update Scene Params
    const { width: canvasWidth, height: canvasHeight } = this.canvasConfig;
    const dpr = this.contextService.getDPR();

    // account for current view offset
    const currentView = { ...this.camera.getView() };

    this.camera.setEnableUpdate(false);
    this.camera.setViewOffset(canvasWidth * dpr, canvasHeight * dpr, x, y, width, height);

    template.setUniforms(SceneUniformBufferIndex, [
      {
        name: SceneUniform.PROJECTION_MATRIX,
        value: this.camera.getPerspective(),
      },
      {
        name: SceneUniform.VIEW_MATRIX,
        value: this.camera.getViewTransform(),
      },
      {
        name: SceneUniform.CAMERA_POSITION,
        value: this.camera.getPosition(),
      },
      {
        name: SceneUniform.DEVICE_PIXEL_RATIO,
        value: this.contextService.getDPR(),
      },
      {
        name: SceneUniform.VIEWPORT,
        value: [canvasWidth, canvasHeight],
      },
      {
        name: SceneUniform.IS_ORTHO,
        value: this.camera.isOrtho() ? 1 : 0,
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

    let target: DisplayObject;
    const readback = device.createReadback();

    const pickingTexture = pickingTemporalTexture.getTextureForResolving();

    // restore previous view
    if (currentView && currentView.enabled) {
      this.camera.setViewOffset(
        currentView.fullWidth,
        currentView.fullHeight,
        currentView.offsetX,
        currentView.offsetY,
        currentView.width,
        currentView.height,
      );
    } else {
      this.camera.clearViewOffset();
    }

    this.camera.setEnableUpdate(true);

    if (pickingTexture) {
      const pickedColors = (await readback.readTexture(
        pickingTexture,
        0,
        0,
        width,
        height,
        new Uint8Array(width * height * 4),
      )) as Uint8Array;

      let pickedFeatureIdx = -1;

      if (
        pickedColors &&
        (pickedColors[0] !== 0 || pickedColors[1] !== 0 || pickedColors[2] !== 0)
      ) {
        pickedFeatureIdx = this.pickingIdGenerator.decodePickingColor(pickedColors);
      }

      if (pickedFeatureIdx > -1) {
        const pickedDisplayObject = this.pickingIdGenerator.getById(pickedFeatureIdx);

        if (
          pickedDisplayObject &&
          pickedDisplayObject.isVisible() &&
          pickedDisplayObject.isInteractive()
        ) {
          target = pickedDisplayObject;
        }
      }
      readback.destroy();
    }

    pickingTemporalTexture.destroy();

    return target;
  }
}
