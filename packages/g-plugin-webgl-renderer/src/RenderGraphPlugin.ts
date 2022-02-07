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
  SHAPE,
  DefaultCamera,
  Camera,
  CanvasEvent,
  parseColor,
  Tuple4Number,
} from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { BatchManager } from './drawcall';
import { Renderable3D } from './components/Renderable3D';
import { WebGLRendererPluginOptions } from './interfaces';
// import { pushFXAAPass } from './passes/FXAA';
// import { useCopyPass } from './passes/Copy';
import { PickingIdGenerator } from './PickingIdGenerator';
import { BlendFactor, BlendMode, Device, SwapChain, Texture, TextureDescriptor } from './platform';
import { setAttachmentStateSimple } from './platform/utils';
import { Device_GL } from './platform/webgl2/Device';
import { Device_WebGPU } from './platform/webgpu/Device';
import { RGAttachmentSlot, RGGraphBuilder } from './render/interfaces';
import { RenderHelper } from './render/RenderHelper';
import { RenderInstList } from './render/RenderInstList';
import { fillMatrix4x4, fillVec3v, fillVec4 } from './render/utils';
import { TransparentWhite, colorNewFromRGBA } from './utils/color';
import {
  AntialiasingMode,
  makeAttachmentClearDescriptor,
  makeBackbufferDescSimple,
  opaqueWhiteFullClearRenderPassDescriptor,
} from './render/RenderGraphHelpers';
import init, { glsl_compile } from '../../../rust/pkg/glsl_wgsl_compiler';
import { Fog, Light } from './lights';
import { LightPool } from './LightPool';
import { TexturePool } from './TexturePool';

// uniforms in scene level
export enum SceneUniform {
  PROJECTION_MATRIX = 'u_ProjectionMatrix',
  VIEW_MATRIX = 'u_ViewMatrix',
  CAMERA_POSITION = 'u_CameraPosition',
  DEVICE_PIXEL_RATIO = 'u_DevicePixelRatio',
  VIEWPORT = 'u_Viewport',
  IS_ORTHO = 'u_IsOrtho',
}

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

  @inject(RenderHelper)
  private renderHelper: RenderHelper;

  @inject(LightPool)
  private lightPool: LightPool;

  @inject(TexturePool)
  private texturePool: TexturePool;

  @inject(BatchManager)
  private batchManager: BatchManager;

  private renderingService: RenderingService;

  private device: Device;

  private swapChain: SwapChain;

  private renderLists = {
    world: new RenderInstList(),
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
    this.renderingService = renderingService;
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

      this.batchManager.attach(this.device, renderingService);
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
     * build frame graph at the beginning of each frame
     */
    renderingService.hooks.beginFrame.tap(RenderGraphPlugin.tag, () => {
      const canvas = this.swapChain.getCanvas();
      const renderInstManager = this.renderHelper.renderInstManager;
      this.builder = this.renderHelper.renderGraph.newGraphBuilder();

      // use canvas.background
      const clearColor = this.canvasConfig.background
        ? colorNewFromRGBA(...(parseColor(this.canvasConfig.background).value as Tuple4Number))
        : TransparentWhite;

      // retrieve at each frame since canvas may resize
      const renderInput = {
        backbufferWidth: canvas.width,
        backbufferHeight: canvas.height,
        antialiasingMode: AntialiasingMode.None,
      };
      // create main Color RT
      const mainRenderDesc = makeBackbufferDescSimple(
        RGAttachmentSlot.Color0,
        renderInput,
        makeAttachmentClearDescriptor(clearColor),
      );
      // create main Depth RT
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
            alphaBlendSrcFactor: BlendFactor.Zero,
            rgbBlendDstFactor: BlendFactor.OneMinusSrcAlpha,
            alphaBlendDstFactor: BlendFactor.One,
          },
        ),
      );

      // Update Scene Params
      const { width, height } = this.canvasConfig;
      template.setUniforms(0, [
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
          value: [width, height],
        },
        {
          name: SceneUniform.IS_ORTHO,
          value: this.camera.isOrtho() ? 1 : 0,
        },
      ]);

      renderInstManager.setCurrentRenderInstList(this.renderLists.world);
      // render batches
      this.batchManager.getBatches().forEach((batch) => {
        batch.render(this.renderLists.world);
      });

      renderInstManager.popTemplateRenderInst();

      if (this.renderLists.world.renderInsts.length > 0) {
        this.renderHelper.prepareToRender();
      }
      this.renderHelper.renderGraph.execute();

      renderInstManager.resetRenderInsts();

      // output to screen
      this.swapChain.present();
    });

    renderingService.hooks.render.tap(RenderGraphPlugin.tag, (object: DisplayObject) => {
      this.batchManager.add(object);
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

      this.batchManager.remove(object);

      // @ts-ignore
      delete object.renderable3D;

      // entity.removeComponent(Geometry3D, true);
      // entity.removeComponent(Material3D, true);
      // entity.removeComponent(Renderable3D, true);
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { attributeName, newValue } = e.detail;
      this.batchManager.updateAttribute(object, attributeName, newValue);
    };

    const handleRenderOrderChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { renderOrder } = e.detail;
      this.batchManager.changeRenderOrder(object, renderOrder);
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
      // @see https://stackoverflow.com/questions/27746091/preservedrawingbuffer-false-is-it-worth-the-effort
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

    try {
      await init('/glsl_wgsl_compiler_bg.wasm');
    } catch (e) {}
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

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: Function,
  ) {
    return this.texturePool.getOrCreateTexture(this.device, src, descriptor, () => {
      this.renderingService.dirtify();
      if (successCallback) {
        successCallback();
      }
    });
  }
}
