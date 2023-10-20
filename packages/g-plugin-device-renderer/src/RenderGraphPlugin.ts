import type {
  CSSRGB,
  DataURLOptions,
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { CanvasEvent, ElementEvent, Shape, parseColor } from '@antv/g-lite';
import { Renderable3D } from './components/Renderable3D';
import type { LightPool } from './LightPool';
import { Fog, Light } from './lights';
import { pushFXAAPass } from './passes/FXAA';
import {
  Device,
  SwapChain,
  Texture,
  TextureDescriptor,
  TransparentBlack,
  TransparentWhite,
} from '@antv/g-device-api';
import {
  BlendFactor,
  BlendMode,
  colorNewFromRGBA,
  setAttachmentStateSimple,
} from '@antv/g-device-api';
import type { RGGraphBuilder, RenderHelper } from './render';
import {
  AntialiasingMode,
  makeAttachmentClearDescriptor,
  makeBackbufferDescSimple,
  opaqueWhiteFullClearRenderPassDescriptor,
  RenderInstList,
  RGAttachmentSlot,
} from './render';
import type { BatchManager } from './renderer';
import type { TexturePool } from './TexturePool';
import { DeviceRendererPluginOptions } from './interfaces';

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

export class RenderGraphPlugin implements RenderingPlugin {
  static tag = 'RenderGraph';

  private context: RenderingPluginContext;

  constructor(
    private renderHelper: RenderHelper,
    private lightPool: LightPool,
    private texturePool: TexturePool,
    private batchManager: BatchManager,
    private options: Partial<DeviceRendererPluginOptions>,
  ) {}

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
  private capturePromise: Promise<string> | undefined;
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

  apply(context: RenderingPluginContext) {
    this.context = context;
    const { renderingService, renderingContext, config } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;
    config.disableRenderHooks = true;

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

      // @ts-ignore
      if (!object.renderable3D) {
        // @ts-ignore
        object.renderable3D = new Renderable3D();
      }

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
      } else if (object.nodeName === Shape.MESH) {
        if (object.style.geometry?.meshes) {
          const index = object.style.geometry.meshes.indexOf(object);
          if (index > -1) {
            object.style.geometry.meshes.splice(index, 1);
          }
        }
        if (object.style.material?.meshes) {
          const index = object.style.material.meshes.indexOf(object);
          if (index > -1) {
            object.style.material.meshes.splice(index, 1);
          }
        }
      }

      if (this.swapChain) {
        this.batchManager.remove(object);
      }

      // @ts-ignore
      delete object.renderable3D;

      // entity.removeComponent(Geometry3D, true);
      // entity.removeComponent(Material3D, true);
      // entity.removeComponent(Renderable3D, true);
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      if (this.swapChain) {
        const object = e.target as DisplayObject;
        const { attrName, newValue } = e;

        if (attrName === 'zIndex') {
          object.parentNode.forEach((child: DisplayObject) => {
            this.batchManager.changeRenderOrder(
              child,
              child.sortable.renderOrder,
            );
          });
        } else {
          this.batchManager.updateAttribute(object, attrName, newValue);
        }
      }
    };

    const handleBoundsChanged = (e: MutationEvent) => {
      if (this.swapChain) {
        const object = e.target as DisplayObject;
        this.batchManager.updateAttribute(object, 'modelMatrix', null);
      }
    };

    renderingService.hooks.initAsync.tapPromise(
      RenderGraphPlugin.tag,
      async () => {
        canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
        canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
        canvas.addEventListener(
          ElementEvent.ATTR_MODIFIED,
          handleAttributeChanged,
        );
        canvas.addEventListener(
          ElementEvent.BOUNDS_CHANGED,
          handleBoundsChanged,
        );
        this.context.config.renderer.getConfig().enableDirtyRectangleRendering =
          false;

        const $canvas =
          this.context.contextService.getDomElement() as HTMLCanvasElement;

        const { width, height } = this.context.config;
        this.context.contextService.resize(width, height);

        // create swap chain and get device
        // @ts-ignore
        this.swapChain = await this.context.deviceContribution.createSwapChain(
          $canvas,
        );
        this.device = this.swapChain.getDevice();
        this.renderHelper.setDevice(this.device);
        this.renderHelper.renderInstManager.disableSimpleMode();
        this.swapChain.configureSwapChain($canvas.width, $canvas.height);

        canvas.addEventListener(CanvasEvent.RESIZE, () => {
          this.swapChain.configureSwapChain($canvas.width, $canvas.height);
        });

        this.batchManager.attach({
          device: this.device,
          ...context,
        });
      },
    );

    renderingService.hooks.destroy.tap(RenderGraphPlugin.tag, () => {
      this.renderHelper.destroy();
      this.batchManager.destroy();
      this.texturePool.destroy();

      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );

      this.device.destroy();
      this.device.checkForLeaks();

      config.disableRenderHooks = false;
    });

    /**
     * build frame graph at the beginning of each frame
     */
    renderingService.hooks.beginFrame.tap(RenderGraphPlugin.tag, () => {
      const canvas = this.swapChain.getCanvas() as HTMLCanvasElement;
      const renderInstManager = this.renderHelper.renderInstManager;
      this.builder = this.renderHelper.renderGraph.newGraphBuilder();

      let clearColor;
      if (this.context.config.background === 'transparent') {
        clearColor = TransparentBlack;
      } else {
        // use canvas.background
        const backgroundColor = parseColor(
          this.context.config.background,
        ) as CSSRGB;

        clearColor = this.context.config.background
          ? // use premultipliedAlpha
            // @see https://canvatechblog.com/alpha-blending-and-webgl-99feb392779e
            colorNewFromRGBA(
              (Number(backgroundColor.r) / 255) * Number(backgroundColor.alpha),
              (Number(backgroundColor.g) / 255) * Number(backgroundColor.alpha),
              (Number(backgroundColor.b) / 255) * Number(backgroundColor.alpha),
              Number(backgroundColor.alpha),
            )
          : TransparentWhite;
      }

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
        'Main Color',
      );
      const mainDepthTargetID = this.builder.createRenderTargetID(
        mainDepthDesc,
        'Main Depth',
      );

      // main render pass
      this.builder.pushPass((pass) => {
        pass.setDebugName('Main Render Pass');
        pass.attachRenderTargetID(RGAttachmentSlot.Color0, mainColorTargetID);
        pass.attachRenderTargetID(
          RGAttachmentSlot.DepthStencil,
          mainDepthTargetID,
        );
        pass.exec((passRenderer) => {
          this.renderLists.world.drawOnPassRenderer(
            renderInstManager.renderCache,
            passRenderer,
          );
        });
      });

      // TODO: other post-processing passes
      if (this.options?.enableFXAA) {
        // FXAA
        pushFXAAPass(
          this.builder,
          this.renderHelper,
          renderInput,
          mainColorTargetID,
        );
      }

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
      template.setBindingLayout({ numUniformBuffers: 2, numSamplers: 0 });
      template.setMegaStateFlags(
        setAttachmentStateSimple(
          {
            depthWrite: true,
            blendConstant: TransparentBlack,
          },
          {
            rgbBlendMode: BlendMode.ADD,
            alphaBlendMode: BlendMode.ADD,
            rgbBlendSrcFactor: BlendFactor.SRC_ALPHA,
            alphaBlendSrcFactor: BlendFactor.ONE,
            rgbBlendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
            alphaBlendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
          },
        ),
      );

      // Update Scene Params
      const { width, height } = this.context.config;
      const camera = this.context.camera;
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
          value: 0,
        },
      ]);

      this.batchManager.render(this.renderLists.world);

      renderInstManager.popTemplateRenderInst();

      this.renderHelper.prepareToRender();
      this.renderHelper.renderGraph.execute();

      renderInstManager.resetRenderInsts();

      // capture here since we don't preserve drawing buffer
      if (this.enableCapture && this.resolveCapturePromise) {
        const { type, encoderOptions } = this.captureOptions;
        const dataURL = (
          this.context.contextService.getDomElement() as HTMLCanvasElement
        ).toDataURL(type, encoderOptions);
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
    return this.texturePool.getOrCreateTexture(
      this.device,
      src,
      descriptor,
      (t) => {
        if (successCallback) {
          successCallback(t);
        }
      },
    );
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
