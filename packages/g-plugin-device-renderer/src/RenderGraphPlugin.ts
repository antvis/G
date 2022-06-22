import type {
  CSSRGB,
  DataURLOptions,
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  Camera,
  CanvasConfig,
  CanvasEvent,
  ContextService,
  DefaultCamera,
  ElementEvent,
  inject,
  parseColor,
  RenderingContext,
  RenderingPluginContribution,
  singleton,
} from '@antv/g';
import { Renderable3D } from './components/Renderable3D';
import { DeviceContribution } from './interfaces';
import { LightPool } from './LightPool';
import { Fog, Light } from './lights';
// import { pushFXAAPass } from './passes/FXAA';
import type { Device, SwapChain, Texture, TextureDescriptor } from './platform';
import {
  BlendFactor,
  BlendMode,
  colorNewFromRGBA,
  setAttachmentStateSimple,
  TransparentBlack,
} from './platform';
import type { RGGraphBuilder } from './render';
import {
  AntialiasingMode,
  makeAttachmentClearDescriptor,
  makeBackbufferDescSimple,
  opaqueWhiteFullClearRenderPassDescriptor,
  RenderHelper,
  RenderInstList,
  RGAttachmentSlot,
} from './render';
import { BatchManager } from './renderer';
import { TexturePool } from './TexturePool';

// scene uniform block index
export const SceneUniformBufferIndex = 0;

// uniforms in scene level
export enum SceneUniform {
  PROJECTION_MATRIX = 'u_ProjectionMatrix',
  VIEW_MATRIX = 'u_ViewMatrix',
  CAMERA_POSITION = 'u_CameraPosition',
  DEVICE_PIXEL_RATIO = 'u_DevicePixelRatio',
  VIEWPORT = 'u_Viewport',
  IS_ORTHO = 'u_IsOrtho',
  IS_PICKING = 'u_IsPicking',
}

@singleton({ contrib: RenderingPluginContribution })
export class RenderGraphPlugin implements RenderingPlugin {
  static tag = 'RenderGraph';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(RenderHelper)
  private renderHelper: RenderHelper;

  @inject(LightPool)
  private lightPool: LightPool;

  @inject(TexturePool)
  private texturePool: TexturePool;

  @inject(BatchManager)
  private batchManager: BatchManager;

  @inject(DeviceContribution)
  private deviceContribution: DeviceContribution;

  private device: Device;

  private swapChain: SwapChain;

  private renderLists = {
    /**
     * used in main forward rendering pass
     */
    world: new RenderInstList(),
    /**
     * used in picking pass, should disable blending
     */
    picking: new RenderInstList(),
  };

  /**
   * Render Graph builder at each frame
   */
  private builder: RGGraphBuilder;

  private enableCapture: boolean;
  private captureOptions: Partial<DataURLOptions>;
  private capturePromise: Promise<any> | undefined;
  private resolveCapturePromise: (dataURL: string) => void;

  getDevice(): Device {
    return this.device;
  }

  getSwapChain(): SwapChain {
    return this.swapChain;
  }

  getRenderLists() {
    return this.renderLists;
  }

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // collect lights
      if (object.nodeName === Light.tag) {
        this.lightPool.addLight(object as unknown as Light);
        return;
      } else if (object.nodeName === Fog.tag) {
        this.lightPool.addFog(object as Fog);
        return;
      }

      const renderable3D = new Renderable3D();

      // add geometry & material required by Renderable3D
      // object.entity.addComponent(Geometry3D);
      // object.entity.addComponent(Material3D);
      // @ts-ignore
      object.renderable3D = renderable3D;

      this.batchManager.add(object);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (object.nodeName === Light.tag) {
        this.lightPool.removeLight(object as unknown as Light);
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

    const handleAttributeChanged = (e: MutationEvent) => {
      const object = e.target as DisplayObject;
      const { attrName, newValue } = e;
      this.batchManager.updateAttribute(object, attrName, newValue);
    };

    const handleRenderOrderChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { renderOrder } = e.detail;
      this.batchManager.changeRenderOrder(object, renderOrder);
    };

    renderingService.hooks.init.tapPromise(RenderGraphPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.addEventListener(
        ElementEvent.RENDER_ORDER_CHANGED,
        handleRenderOrderChanged,
      );
      this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      const $canvas = this.contextService.getDomElement() as HTMLCanvasElement;

      const { width, height } = this.canvasConfig;
      this.contextService.resize(width, height);

      // create swap chain and get device
      this.swapChain = await this.deviceContribution.createSwapChain($canvas);
      this.device = this.swapChain.getDevice();
      this.renderHelper.setDevice(this.device);
      this.renderHelper.renderInstManager.disableSimpleMode();
      this.swapChain.configureSwapChain($canvas.width, $canvas.height);

      this.renderingContext.root.ownerDocument.defaultView.addEventListener(
        CanvasEvent.RESIZE,
        () => {
          this.swapChain.configureSwapChain($canvas.width, $canvas.height);
        },
      );

      this.batchManager.attach(this.device, renderingService);
    });

    renderingService.hooks.destroy.tap(RenderGraphPlugin.tag, () => {
      this.renderHelper.destroy();

      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
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
      const canvas = this.swapChain.getCanvas() as HTMLCanvasElement;
      const renderInstManager = this.renderHelper.renderInstManager;
      this.builder = this.renderHelper.renderGraph.newGraphBuilder();

      // use canvas.background
      const backgroundColor = parseColor(this.canvasConfig.background) as CSSRGB;
      const clearColor = this.canvasConfig.background
        ? // use premultipliedAlpha
          // @see https://canvatechblog.com/alpha-blending-and-webgl-99feb392779e
          colorNewFromRGBA(
            (Number(backgroundColor.r) / 255) * Number(backgroundColor.alpha),
            (Number(backgroundColor.g) / 255) * Number(backgroundColor.alpha),
            (Number(backgroundColor.b) / 255) * Number(backgroundColor.alpha),
            Number(backgroundColor.alpha),
          )
        : TransparentBlack;

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
      const mainColorTargetID = this.builder.createRenderTargetID(mainRenderDesc, 'Main Color');
      const mainDepthTargetID = this.builder.createRenderTargetID(mainDepthDesc, 'Main Depth');

      // main render pass
      this.builder.pushPass((pass) => {
        pass.setDebugName('Main Render Pass');
        pass.attachRenderTargetID(RGAttachmentSlot.Color0, mainColorTargetID);
        pass.attachRenderTargetID(RGAttachmentSlot.DepthStencil, mainDepthTargetID);
        pass.exec((passRenderer) => {
          this.renderLists.world.drawOnPassRenderer(renderInstManager.renderCache, passRenderer);
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
            blendConstant: TransparentBlack,
          },
          {
            rgbBlendMode: BlendMode.Add,
            alphaBlendMode: BlendMode.Add,
            rgbBlendSrcFactor: BlendFactor.SrcAlpha,
            alphaBlendSrcFactor: BlendFactor.One,
            rgbBlendDstFactor: BlendFactor.OneMinusSrcAlpha,
            alphaBlendDstFactor: BlendFactor.OneMinusSrcAlpha,
          },
        ),
      );

      // Update Scene Params
      const { width, height } = this.canvasConfig;
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
          value: [width, height],
        },
        {
          name: SceneUniform.IS_ORTHO,
          value: this.camera.isOrtho() ? 1 : 0,
        },
        {
          name: SceneUniform.IS_PICKING,
          value: 0,
        },
      ]);

      this.batchManager.render(this.renderLists.world);

      renderInstManager.popTemplateRenderInst();

      this.renderHelper.prepareToRender();
      this.renderHelper.renderGraph.execute();

      renderInstManager.resetRenderInsts();

      // output to screen
      this.swapChain.present();

      // capture here since we don't preserve drawing buffer
      if (this.enableCapture && this.resolveCapturePromise) {
        const { type, encoderOptions } = this.captureOptions;
        const dataURL = (this.contextService.getDomElement() as HTMLCanvasElement).toDataURL(
          type,
          encoderOptions,
        );
        this.resolveCapturePromise(dataURL);
        this.enableCapture = false;
        this.captureOptions = undefined;
        this.resolveCapturePromise = undefined;
      }
    });
  }

  /**
   * load texture in an async way and render when loaded
   */
  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
  ) {
    return this.texturePool.getOrCreateTexture(this.device, src, descriptor, (t) => {
      if (successCallback) {
        successCallback(t);
      }
    });
  }

  async toDataURL(options: Partial<DataURLOptions>) {
    // trigger re-render
    this.enableCapture = true;
    this.captureOptions = options;
    this.capturePromise = new Promise((resolve) => {
      this.resolveCapturePromise = (dataURL: string) => {
        resolve(dataURL);
      };
    });
    return this.capturePromise;
  }
}
