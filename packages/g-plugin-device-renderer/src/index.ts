import type { DataURLOptions, GlobalRuntime } from '@antv/g-lite';
import { Shape, AbstractRendererPlugin } from '@antv/g-lite';
import type { Texture, TextureDescriptor } from '@antv/g-device-api';
import { Renderable3D } from './components/Renderable3D';
import { LightPool } from './LightPool';
import { Mesh } from './Mesh';
import { MeshUpdater } from './MeshUpdater';
import { PickingIdGenerator } from './PickingIdGenerator';
import { PickingPlugin } from './PickingPlugin';
import { RenderHelper } from './render/RenderHelper';
import {
  Batch,
  BatchManager,
  CircleRenderer,
  ImageRenderer,
  LineRenderer,
  MeshRenderer,
  PathRenderer,
  RectRenderer,
  TextRenderer,
} from './renderer';
import { RenderGraphPlugin } from './RenderGraphPlugin';
import { TexturePool } from './TexturePool';
import {
  DeviceRendererPluginOptions,
  RendererParameters,
  ToneMapping,
} from './interfaces';

export * from './geometries';
export * from './interfaces';
export * from './lights';
export * from './materials';
export * from './drawcalls';
export * from './passes';
export * from './render';
export * from './utils';
export { Renderable3D, Batch, TexturePool, RenderGraphPlugin, Mesh };

export class Plugin extends AbstractRendererPlugin {
  name = 'device-renderer';

  parameters: RendererParameters = {
    /**
     * ToneMapping is a renderer-level parameter, it will affect all materials.
     * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer.toneMapping
     */
    toneMapping: ToneMapping.NONE,
    toneMappingExposure: 1,
  };

  constructor(private options: Partial<DeviceRendererPluginOptions> = {}) {
    super();
  }

  init(runtime: GlobalRuntime): void {
    runtime.geometryUpdaterFactory[Shape.MESH] = new MeshUpdater();

    const renderHelper = new RenderHelper(this.parameters);
    const lightPool = new LightPool();
    const texturePool = new TexturePool(this.context, runtime);
    const pickingIdGenerator = new PickingIdGenerator();

    const circleRenderer = new CircleRenderer();
    const pathRenderer = new PathRenderer();
    const rendererFactory: Record<Shape, Batch> = {
      [Shape.CIRCLE]: circleRenderer,
      [Shape.ELLIPSE]: circleRenderer,
      [Shape.POLYLINE]: pathRenderer,
      [Shape.PATH]: pathRenderer,
      [Shape.POLYGON]: pathRenderer,
      [Shape.RECT]: new RectRenderer(),
      [Shape.IMAGE]: new ImageRenderer(),
      [Shape.LINE]: new LineRenderer(),
      [Shape.TEXT]: new TextRenderer(),
      [Shape.MESH]: new MeshRenderer(),
      [Shape.GROUP]: undefined,
      [Shape.HTML]: undefined,
    };

    const batchManager = new BatchManager(
      renderHelper,
      rendererFactory,
      texturePool,
      lightPool,
    );

    const renderGraphPlugin = new RenderGraphPlugin(
      renderHelper,
      lightPool,
      texturePool,
      batchManager,
      this.options,
    );
    this.addRenderingPlugin(renderGraphPlugin);
    this.addRenderingPlugin(
      new PickingPlugin(
        renderHelper,
        renderGraphPlugin,
        pickingIdGenerator,
        batchManager,
      ),
    );
  }
  destroy(runtime: GlobalRuntime): void {
    delete runtime.geometryUpdaterFactory[Shape.MESH];
  }

  private getRenderGraphPlugin() {
    return this.plugins[0] as RenderGraphPlugin;
  }

  getDevice() {
    return this.getRenderGraphPlugin().getDevice();
  }

  getSwapChain() {
    return this.getRenderGraphPlugin().getSwapChain();
  }

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
  ) {
    return this.getRenderGraphPlugin().loadTexture(
      src,
      descriptor,
      successCallback,
    );
  }

  toDataURL(options: Partial<DataURLOptions>) {
    return this.getRenderGraphPlugin().toDataURL(options);
  }

  setParameters(parameters: Partial<RendererParameters>) {
    this.parameters = {
      ...this.parameters,
      ...parameters,
    };
  }
}
