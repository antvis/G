import {
  RenderingService,
  RenderingPlugin,
  Rectangle,
  ContextService,
  CanvasConfig,
  RenderingContext,
  ElementEvent,
  FederatedEvent,
  DisplayObject,
  Renderable,
  SHAPE,
  DefaultCamera,
  Camera,
  RenderingServiceEvent,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { Batch, RendererFactory } from './drawcall';
// import { Geometry3D } from './components/Geometry3D';
// import { Material3D } from './components/Material3D';
import { Renderable3D } from './components/Renderable3D';
import { WebGLRendererPluginOptions } from './interfaces';
import { pushFXAAPass } from './passes/FXAA';
import { pushCopyPass } from './passes/Copy';
import { PickingIdGenerator } from './PickingIdGenerator';
import {
  BlendFactor,
  BlendMode,
  CompareMode,
  CullMode,
  Device,
  Format,
  SwapChain,
  Texture,
} from './platform';
import { reverseDepthForClearValue, setAttachmentStateSimple } from './platform/utils';
import { Device_GL } from './platform/webgl2/Device';
import { Device_WebGPU } from './platform/webgpu/Device';
import { RGAttachmentSlot, RGGraphBuilder } from './render/interfaces';
import { RenderHelper } from './render/RenderHelper';
import { RenderInstList } from './render/RenderInstList';
import { RGRenderTargetDescription } from './render/RenderTargetDescription';
import { fillMatrix4x4, fillVec3v, fillVec4, fillVec4v } from './render/utils';
import { TransparentWhite, White } from './utils/color';
import { isWebGL2 } from './platform/webgl2/utils';

@injectable()
export class RenderGraphPlugin implements RenderingPlugin {
  static tag = 'RenderGraphPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(WebGLRendererPluginOptions)
  private pluginOptions: WebGLRendererPluginOptions;

  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  @inject(RendererFactory)
  private rendererFactory: (shape: string) => Batch;

  @inject(RenderHelper)
  private renderHelper: RenderHelper;

  private device: Device;

  private swapChain: SwapChain;

  private batches: Batch[] = [];

  private renderLists = {
    skyscape: new RenderInstList(),
    world: new RenderInstList(),
    picking: new RenderInstList(),
  };

  /**
   * Render Graph builder at each frame
   */
  private builder: RGGraphBuilder;

  private pickingTexture: Texture;

  getDevice(): Device {
    return this.device;
  }

  apply(renderingService: RenderingService) {
    renderingService.emitter.on(RenderingServiceEvent.Init, async (e, next) => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
      this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      const dpr = this.contextService.getDPR();
      const $canvas = this.contextService.getDomElement() as HTMLCanvasElement;

      const { width, height } = this.canvasConfig;
      this.contextService.resize(width, height);

      await this.createSwapChain($canvas);

      this.device = this.swapChain.getDevice();
      this.renderHelper.setDevice(this.device);
      this.renderHelper.renderInstManager.disableSimpleMode();
      this.swapChain.configureSwapChain($canvas.width, $canvas.height);

      // call next
      next();
    });

    renderingService.emitter.on(RenderingServiceEvent.Destroy, () => {
      this.renderHelper.destroy();
      this.batches.forEach((batch) => batch.destroy());
    });

    /**
     * build frame graph at begining of each frame
     */
    renderingService.emitter.on(RenderingServiceEvent.BeginFrame, () => {
      const canvas = this.swapChain.getCanvas();
      const renderInstManager = this.renderHelper.renderInstManager;
      this.builder = this.renderHelper.renderGraph.newGraphBuilder();

      // create main rt
      const mainRenderTarget = new RGRenderTargetDescription(Format.U8_RGBA_RT);
      mainRenderTarget.colorClearColor = White;
      mainRenderTarget.setDimensions(canvas.width, canvas.height, 1);
      // create main depth & stencil
      const mainDepthDesc = new RGRenderTargetDescription(Format.D24);
      mainDepthDesc.depthClearValue = reverseDepthForClearValue(1.0);
      mainDepthDesc.stencilClearValue = 0.0;
      mainDepthDesc.setDimensions(canvas.width, canvas.height, 1);

      const mainColorTargetID = this.builder.createRenderTargetID(
        mainRenderTarget,
        'Main Render Target',
      );
      const mainDepthTargetID = this.builder.createRenderTargetID(mainDepthDesc, 'Main Depth');
      const pickingColorTargetID = this.builder.createRenderTargetID(
        mainRenderTarget,
        'Picking Render Target',
      );

      // main render pass
      this.builder.pushPass((pass) => {
        pass.setDebugName('Main Render Pass');
        pass.attachRenderTargetID(RGAttachmentSlot.Color0, mainColorTargetID);
        pass.attachRenderTargetID(RGAttachmentSlot.Color1, pickingColorTargetID);
        pass.attachRenderTargetID(RGAttachmentSlot.DepthStencil, mainDepthTargetID);
        pass.exec((passRenderer) => {
          renderInstManager.drawListOnPassRenderer(this.renderLists.world, passRenderer);
        });
        pass.post((scope) => {
          this.pickingTexture = scope.getRenderTargetTexture(RGAttachmentSlot.Color1);
        });
      });

      // WebGL1 need an extra blit pass
      // if (this.device.queryVendorInfo().platformString === 'WebGL1') {
      //   pushCopyPass(
      //     this.builder,
      //     this.renderHelper,
      //     {
      //       backbufferWidth: canvas.width,
      //       backbufferHeight: canvas.height,
      //     },
      //     mainColorTargetID,
      //   );
      // }

      // TODO: other post-processing passes
      // FXAA
      // pushFXAAPass(
      //   this.builder,
      //   this.renderHelper,
      //   {
      //     backbufferWidth: canvas.width,
      //     backbufferHeight: canvas.height,
      //   },
      //   mainColorTargetID,
      // );

      // output to screen
      this.builder.resolveRenderTargetToExternalTexture(
        mainColorTargetID,
        this.swapChain.getOnscreenTexture(),
      );
    });

    renderingService.emitter.on(RenderingServiceEvent.EndFrame, () => {
      const renderInstManager = this.renderHelper.renderInstManager;

      // TODO: time for GPU Animation
      // const timeInMilliseconds = window.performance.now();

      // Push our outer template, which contains the dynamic UBO bindings...
      const template = this.renderHelper.pushTemplateRenderInst();
      // SceneParams: binding = 0, ObjectParams: binding = 1
      template.setBindingLayouts([{ numUniformBuffers: 2, numSamplers: 0 }]);
      template.setMegaStateFlags(
        setAttachmentStateSimple(
          {
            depthWrite: true,
            cullMode: CullMode.Back,
          },
          {
            blendMode: BlendMode.Add,
            blendSrcFactor: BlendFactor.SrcAlpha,
            blendDstFactor: BlendFactor.OneMinusSrcAlpha,
          },
        ),
      );

      // Update Scene Params
      let offs = template.allocateUniformBuffer(0, 16 + 16 + 4);
      let d = template.mapUniformBufferF32(0);
      offs += fillMatrix4x4(d, offs, this.camera.getPerspective()); // ProjectionMatrix 16
      offs += fillMatrix4x4(d, offs, this.camera.getViewTransform()); // ViewMatrix 16
      offs += fillVec3v(d, offs, this.camera.getPosition(), this.contextService.getDPR()); // CameraPosition DPR 4

      renderInstManager.setCurrentRenderInstList(this.renderLists.world);
      // render batches
      this.batches.forEach((batch) => {
        batch.render(this.renderLists.world);
      });

      renderInstManager.popTemplateRenderInst();
      this.renderHelper.prepareToRender();
      this.renderHelper.renderGraph.execute(this.builder);
      renderInstManager.resetRenderInsts();

      // output to screen
      this.swapChain.present();

      // // need an extra program to render texture to screen in WebGL1
      // if (this.device.queryVendorInfo().platformString === 'WebGL1') {
      //   const program = this.renderHelper
      //   .getCache()
      //   .createProgramSimple(this.programDescriptorSimpleWithOrig);
      // }
    });

    renderingService.emitter.on(RenderingServiceEvent.Render, (object: DisplayObject) => {
      if (object.nodeName === SHAPE.Group) {
        return;
      }

      const renderable3d = object.entity.getComponent(Renderable3D);
      if (renderable3d && !renderable3d.batchId) {
        let existed = this.batches.find((batch) => batch.checkBatchable(object));
        if (!existed) {
          existed = this.rendererFactory(object.nodeName);

          if (existed) {
            existed.init(this.device, renderingService);
            this.batches.push(existed);
          }
        }

        if (existed) {
          existed.merge(object);
          renderable3d.batchId = existed.id;
        }
      }
    });

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      const renderable3d = object.entity.addComponent(Renderable3D);
      // add geometry & material required by Renderable3D
      // object.entity.addComponent(Geometry3D);
      // object.entity.addComponent(Material3D);

      // generate picking id for later use
      const pickingId = this.pickingIdGenerator.getId(object);
      renderable3d.pickingId = pickingId;
      renderable3d.encodedPickingColor = this.pickingIdGenerator.encodePickingColor(pickingId);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const entity = object.entity;

      const renderable3d = entity.getComponent(Renderable3D);
      if (renderable3d && renderable3d.batchId) {
        const existed = this.batches.find((batch) => batch.id === renderable3d.batchId);
        if (existed) {
          existed.purge(object);
        }
      }

      // entity.removeComponent(Geometry3D, true);
      // entity.removeComponent(Material3D, true);

      entity.removeComponent(Renderable3D, true);
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { attributeName, newValue } = e.detail;
      const renderable3d = object.entity.getComponent(Renderable3D);
      const batch = this.batches.find((batch) => renderable3d.batchId === batch.id);
      if (batch) {
        batch.updateAttribute(object, attributeName, newValue);
      }
    };
  }

  /**
   * auto downgrade from WebGPU to WebGL2 & 1
   */
  private async createSwapChain($canvas: HTMLCanvasElement) {
    const { targets } = this.pluginOptions;

    // use WebGPU first
    if (targets.includes('webgpu')) {
      // use WebGPU if possible
      this.swapChain = await this.createSwapChainForWebGPU($canvas);
    }

    if (!this.swapChain) {
      const options: WebGLContextAttributes = {
        antialias: false,
        preserveDrawingBuffer: false,
        // @see https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
        // premultipliedAlpha: false,
      };
      this.handleContextEvents($canvas);

      let gl: WebGLRenderingContext | WebGL2RenderingContext;
      if (targets.includes('webgl2')) {
        gl =
          $canvas.getContext('webgl2', options) ||
          ($canvas.getContext('experimental-webgl2', options) as WebGL2RenderingContext);
      }

      if (!gl && targets.includes('webgl1')) {
        gl =
          $canvas.getContext('webgl', options) ||
          ($canvas.getContext('experimental-webgl', options) as WebGLRenderingContext);
      }

      this.swapChain = new Device_GL(gl as WebGLRenderingContext | WebGL2RenderingContext, {
        shaderDebug: true,
        trackResources: true,
      });
    }
  }

  private async createSwapChainForWebGPU(
    canvas: HTMLCanvasElement | OffscreenCanvas,
  ): Promise<SwapChain | null> {
    if (navigator.gpu === undefined) return null;

    let adapter = null;
    try {
      adapter = await navigator.gpu.requestAdapter();
    } catch (e) {
      console.log(e);
    }

    if (adapter === null) return null;

    const device = await adapter.requestDevice();

    if (device === null) return null;

    const context = canvas.getContext('webgpu');

    if (!context) return null;

    return new Device_WebGPU(adapter, device, canvas, context);
  }

  private handleContextEvents($canvas: HTMLCanvasElement) {
    const { onContextLost, onContextRestored, onContextCreationError } = this.pluginOptions;
    // bind context event listeners
    if (onContextCreationError) {
      // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event
      $canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
    }
    if (onContextLost) {
      $canvas.addEventListener('webglcontextlost', onContextLost, false);
    }
    if (onContextRestored) {
      $canvas.addEventListener('webglcontextrestored', onContextRestored, false);
    }

    // TODO: https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md#fatal-errors-requestadapter-requestdevice-and-devicelost
  }

  /**
   * return displayobjects in target rectangle
   */
  async pickByRectangle(rect: Rectangle): Promise<DisplayObject[]> {
    const targets: DisplayObject[] = [];
    const readback = this.device.createReadback();

    if (this.pickingTexture) {
      const pickedColors = (await readback.readTexture(
        this.pickingTexture,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        new Uint8Array(rect.width * rect.height * 4),
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
          pickedDisplayObject.interactive &&
          targets.indexOf(pickedDisplayObject) === -1
        ) {
          targets.push(pickedDisplayObject);
        }
      }
      readback.destroy();
    }

    return targets;
  }
}
