import type {
  CanvasConfig,
  FederatedWheelEvent,
  ICamera,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import Hammer from 'hammerjs';

const MOTION_FACTOR = 10;

export class ControlPlugin implements RenderingPlugin {
  static tag = 'Control';

  private camera: ICamera;
  private canvasConfig: Partial<CanvasConfig>;

  private hammertime: HammerManager;

  private isMoving = false;
  private lastX = -1;
  private lastY = -1;
  private ctrlKey: boolean;
  private shiftKey: boolean;
  private altKey: boolean;
  private context: RenderingPluginContext;

  apply(context: RenderingPluginContext) {
    const { config, camera, renderingService, renderingContext } = context;
    this.canvasConfig = config;
    this.camera = camera;
    this.context = context;

    renderingService.hooks.init.tap(ControlPlugin.tag, () => {
      const root = renderingContext.root.ownerDocument.defaultView;
      // @ts-ignore
      this.hammertime = new Hammer(root);

      this.hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
      this.hammertime.get('pinch').set({ enable: true });
      this.hammertime.on('panstart', this.onPanstart);
      this.hammertime.on('panmove', this.onPanmove);
      this.hammertime.on('panend', this.onPanend);
      this.hammertime.on('pinch', this.onPinch);

      root.addEventListener('wheel', this.onMousewheel);
    });

    renderingService.hooks.destroy.tap(ControlPlugin.tag, () => {
      this.hammertime.off('panstart', this.onPanstart);
      this.hammertime.off('panmove', this.onPanmove);
      this.hammertime.off('panend', this.onPanend);
      this.hammertime.off('pinch', this.onPinch);

      const { root } = renderingContext;
      root.removeEventListener('wheel', this.onMousewheel);
    });
  }

  private onPanstart = (e: HammerInput) => {
    this.lastX = e.center.x;
    this.lastY = e.center.y;
    this.isMoving = true;
  };

  private onPanmove = (e: HammerInput) => {
    // https://gist.github.com/handleman/3c99e754065f647b082f
    const isMac =
      this.context.globalThis.navigator.platform.toUpperCase().indexOf('MAC') >=
      0;

    this.ctrlKey = e.srcEvent.ctrlKey;
    if (isMac && e.srcEvent.metaKey) {
      this.ctrlKey = true;
    }
    this.altKey = e.srcEvent.altKey;
    this.shiftKey = e.srcEvent.shiftKey;

    if (this.isMoving) {
      const deltaX = e.center.x - this.lastX;
      const deltaY = e.center.y - this.lastY;
      this.lastX = e.center.x;
      this.lastY = e.center.y;
      if (this.ctrlKey && !this.shiftKey) {
        this.dolly(deltaY);
      } else if (this.shiftKey && !this.ctrlKey) {
        this.pan(deltaX, deltaY);
      } else if (this.ctrlKey && this.shiftKey) {
        this.roll(deltaY);
      } else {
        this.rotate(deltaX, deltaY);
      }
    }
  };

  private onPanend = (e: HammerInput) => {
    this.isMoving = false;
  };

  private onPinch = (e: HammerInput) => {
    const deltaZ = (1 - e.scale) * 10;
    this.dolly(deltaZ);
  };

  private onMousewheel = (e: FederatedWheelEvent) => {
    this.dolly(e.deltaY);
  };

  private dolly(z: number) {
    this.camera.dolly(z);
  }

  private pan(dx: number, dy: number) {
    const { width, height } = this.canvasConfig;
    const dimMax = Math.max(width, height);
    const deltaX = 1 / dimMax;
    const deltaY = 1 / dimMax;
    const ndx = (dx * deltaX * MOTION_FACTOR) / 2;
    const ndy = (-dy * deltaY * MOTION_FACTOR) / 2;

    this.camera.pan(ndx, ndy);
  }

  private roll(dy: number) {
    const { width } = this.canvasConfig;
    this.camera.rotate(0, 0, (-20.0 / width) * dy * MOTION_FACTOR);
  }

  private rotate(rx: number, ry: number) {
    const { width, height } = this.canvasConfig;
    const dx = 20.0 / height;
    const dy = 20.0 / width;
    let motionFactorX = MOTION_FACTOR;
    let motionFactorY = MOTION_FACTOR;
    if (rx * rx > 2 * ry * ry) {
      motionFactorY *= 0.5;
    } else if (ry * ry > 2 * rx * rx) {
      motionFactorX *= 0.5;
    }

    const rotX = rx * dx * motionFactorX;
    const rotY = ry * dy * motionFactorY;

    this.camera.rotate(rotX, -rotY, 0);
  }
}
