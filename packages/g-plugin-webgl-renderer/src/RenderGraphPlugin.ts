import {
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
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
  CanvasEvent,
  parseColor,
  Tuple4Number,
} from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { Batch } from './drawcall';
// import { Geometry3D } from './components/Geometry3D';
// import { Material3D } from './components/Material3D';
import { Renderable3D } from './components/Renderable3D';
import { WebGLRendererPluginOptions } from './interfaces';
import { pushFXAAPass } from './passes/FXAA';
import { useCopyPass } from './passes/Copy';
import { PickingIdGenerator } from './PickingIdGenerator';
import {
  BindingLayoutDescriptor,
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
import { TransparentWhite, OpaqueWhite, colorNewFromRGBA } from './utils/color';
import { isWebGL2 } from './platform/webgl2/utils';
import { RendererFactory } from './tokens';
import {
  AntialiasingMode,
  makeAttachmentClearDescriptor,
  makeBackbufferDescSimple,
  opaqueBlackFullClearRenderPassDescriptor,
  opaqueWhiteFullClearRenderPassDescriptor,
} from './render/RenderGraphHelpers';
import naga from '../../../rust/pkg/index_bg.wasm';
import { Fog, Light } from './lights';
import { LightPool } from './LightPool';

@singleton({ contrib: RenderingPluginContribution })
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

  @inject(LightPool)
  private lightPool: LightPool;

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
    renderingService.hooks.init.tapPromise(RenderGraphPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
      this.renderingContext.root.addEventListener(
        ElementEvent.RENDER_ORDER_CHANGED,
        handleRenderOrderChanged,
      );
      this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      // const dpr = this.contextService.getDPR();
      const $canvas = this.contextService.getDomElement() as HTMLCanvasElement;

      const { width, height } = this.canvasConfig;
      this.contextService.resize(width, height);

      await this.createSwapChain($canvas);

      this.device = this.swapChain.getDevice();
      this.renderHelper.setDevice(this.device);
      this.renderHelper.renderInstManager.disableSimpleMode();
      this.swapChain.configureSwapChain($canvas.width, $canvas.height);

      this.renderingContext.root.ownerDocument.defaultView.on(CanvasEvent.RESIZE, () => {
        this.swapChain.configureSwapChain($canvas.width, $canvas.height);
      });
    });

    renderingService.hooks.destroy.tap(RenderGraphPlugin.tag, () => {
      this.renderHelper.destroy();
      // this.batches.forEach((batch) => batch.destroy());

      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
      this.renderingContext.root.removeEventListener(
        ElementEvent.RENDER_ORDER_CHANGED,
        handleRenderOrderChanged,
      );
    });

    /**
     * build frame graph at begining of each frame
     */
    renderingService.hooks.beginFrame.tap(RenderGraphPlugin.tag, () => {
      const canvas = this.swapChain.getCanvas();
      const renderInstManager = this.renderHelper.renderInstManager;
      this.builder = this.renderHelper.renderGraph.newGraphBuilder();

      const clearColor = parseColor(this.canvasConfig.background).value as Tuple4Number;

      // retrieve at each frame since canvas may resize
      const renderInput = {
        backbufferWidth: canvas.width,
        backbufferHeight: canvas.height,
        antialiasingMode: AntialiasingMode.None,
      };
      // create main rt
      const mainRenderDesc = makeBackbufferDescSimple(
        RGAttachmentSlot.Color0,
        renderInput,
        makeAttachmentClearDescriptor(colorNewFromRGBA(...clearColor)),
      );
      const mainDepthDesc = makeBackbufferDescSimple(
        RGAttachmentSlot.DepthStencil,
        renderInput,
        opaqueWhiteFullClearRenderPassDescriptor,
      );

      const mainColorTargetID = this.builder.createRenderTargetID(
        mainRenderDesc,
        'Main Render Target',
      );
      const mainDepthTargetID = this.builder.createRenderTargetID(mainDepthDesc, 'Main Depth');
      const pickingColorTargetID = this.builder.createRenderTargetID(
        mainRenderDesc,
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

      // TODO: other post-processing passes
      // FXAA
      // pushFXAAPass(this.builder, this.renderHelper, renderInput, mainColorTargetID);

      // output to screen
      this.builder.resolveRenderTargetToExternalTexture(
        mainColorTargetID,
        this.swapChain.getOnscreenTexture(),
      );
    });

    renderingService.hooks.endFrame.tap(RenderGraphPlugin.tag, () => {
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
          },
          {
            rgbBlendMode: BlendMode.Add,
            alphaBlendMode: BlendMode.Add,
            rgbBlendSrcFactor: BlendFactor.SrcAlpha,
            alphaBlendSrcFactor: BlendFactor.One,
            rgbBlendDstFactor: BlendFactor.OneMinusSrcAlpha,
            alphaBlendDstFactor: BlendFactor.One,
          },
        ),
      );

      // Update Scene Params
      let offs = template.allocateUniformBuffer(0, 16 + 16 + 4 + 4);
      let d = template.mapUniformBufferF32(0);
      offs += fillMatrix4x4(d, offs, this.camera.getPerspective()); // ProjectionMatrix 16
      offs += fillMatrix4x4(d, offs, this.camera.getViewTransform()); // ViewMatrix 16
      offs += fillVec3v(d, offs, this.camera.getPosition(), this.contextService.getDPR()); // CameraPosition DPR isOrtho 4
      const { width, height } = this.canvasConfig;
      offs += fillVec4(d, offs, width, height, this.camera.isOrtho() ? 1 : 0); // Viewport isOrtho

      renderInstManager.setCurrentRenderInstList(this.renderLists.world);
      // render batches
      this.batches.forEach((batch) => {
        batch.render(this.renderLists.world);
      });

      renderInstManager.popTemplateRenderInst();
      this.renderHelper.prepareToRender();
      this.renderHelper.renderGraph.execute();
      renderInstManager.resetRenderInsts();

      // output to screen
      this.swapChain.present();
    });

    renderingService.hooks.render.tap(RenderGraphPlugin.tag, (object: DisplayObject) => {
      if (object.nodeName === SHAPE.Group) {
        return;
      }

      // @ts-ignore
      const renderable3d = object.renderable3D;
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

      // collect lights
      if (object.nodeName === Light.tag) {
        this.lightPool.addLight(object as Light);
        return;
      } else if (object.nodeName === Fog.tag) {
        this.lightPool.addFog(object as Fog);
        return;
      }

      const renderable3D = new Renderable3D();

      // add geometry & material required by Renderable3D
      // object.entity.addComponent(Geometry3D);
      // object.entity.addComponent(Material3D);

      // generate picking id for later use
      const pickingId = this.pickingIdGenerator.getId(object);
      renderable3D.pickingId = pickingId;
      renderable3D.encodedPickingColor = this.pickingIdGenerator.encodePickingColor(pickingId);

      // @ts-ignore
      object.renderable3D = renderable3D;
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (object.nodeName === Light.tag) {
        this.lightPool.removeLight(object as Light);
        return;
      } else if (object.nodeName === Fog.tag) {
        this.lightPool.removeFog(object as Fog);
        return;
      }

      // @ts-ignore
      const renderable3D = object.renderable3D;
      if (renderable3D && renderable3D.batchId) {
        const existedIndex = this.batches.findIndex((batch) => batch.id === renderable3D.batchId);
        const existed = this.batches[existedIndex];
        if (existed) {
          existed.purge(object);

          // remove batch
          if (existed.objects.length === 0) {
            this.batches.splice(existedIndex, 1);
          }
        }
      }

      // @ts-ignore
      delete object.renderable3D;

      // entity.removeComponent(Geometry3D, true);
      // entity.removeComponent(Material3D, true);
      // entity.removeComponent(Renderable3D, true);
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { attributeName, newValue } = e.detail;
      // @ts-ignore
      const renderable3D = object.renderable3D;
      if (renderable3D) {
        const batch = this.batches.find((batch) => renderable3D.batchId === batch.id);
        if (batch) {
          batch.updateAttribute(object, attributeName, newValue);
        }
      }
    };

    const handleRenderOrderChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { renderOrder } = e.detail;
      // @ts-ignore
      const renderable3D = object.renderable3D;
      if (renderable3D) {
        const batch = this.batches.find((batch) => renderable3D.batchId === batch.id);
        if (batch) {
          batch.changeRenderOrder(object, renderOrder);
        }
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
      this.swapChain = this.createSwapChainForWebGL($canvas, targets);
    }
  }

  private createSwapChainForWebGL($canvas: HTMLCanvasElement, targets: string[]) {
    const options: WebGLContextAttributes = {
      antialias: false,
      preserveDrawingBuffer: false,
      // @see https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-use-the-stencil-buffer.html
      stencil: true,
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

    return new Device_GL(gl as WebGLRenderingContext | WebGL2RenderingContext, {
      shaderDebug: true,
      trackResources: true,
    });
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

    // @see https://www.w3.org/TR/webgpu/#dom-gpudevicedescriptor-requiredfeatures
    const optionalFeatures: GPUFeatureName[] = [
      'depth24unorm-stencil8',
      'depth32float-stencil8',
      'texture-compression-bc',
    ];
    const requiredFeatures = optionalFeatures.filter((feature) => adapter.features.has(feature));
    const device = await adapter.requestDevice({ requiredFeatures });

    if (device === null) return null;

    const context = canvas.getContext('webgpu');

    if (!context) return null;

    // @ts-ignore
    const { glsl_compile } = await naga();
    return new Device_WebGPU(adapter, device, canvas, context, glsl_compile);
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
