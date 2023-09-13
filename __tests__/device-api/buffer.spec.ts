import {
  Device,
  BufferUsage,
  ResourceType,
} from '../../packages/g-plugin-device-renderer';
import { WebGLDeviceContribution } from '../../packages/g-plugin-webgl-device';
import { Rectangle } from '../../packages/g';
import GL from 'gl';

const deviceContribution = new WebGLDeviceContribution({
  targets: ['webgl1'],
  onContextCreationError: () => {},
  onContextLost: () => {},
  onContextRestored(e) {},
});

const width = 100;
const height = 100;
const gl = GL(width, height, {
  antialias: false,
  preserveDrawingBuffer: true,
  stencil: true,
});
const mockCanvas: HTMLCanvasElement = {
  width,
  height,
  // @ts-ignore
  getContext: () => {
    // @ts-ignore
    gl.canvas = mockCanvas;
    // 模拟 DOM API，返回小程序 context，它应当和 CanvasRenderingContext2D 一致
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
    return gl;
  },
  getBoundingClientRect: () => {
    // 模拟 DOM API，返回小程序 context 相对于视口的位置
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
    return new Rectangle(0, 0, width, height);
  },
};

let device: Device;
describe('Buffer', () => {
  beforeAll(async () => {
    // create swap chain and get device
    const swapChain = await deviceContribution.createSwapChain(mockCanvas);
    swapChain.configureSwapChain(width, height);
    device = swapChain.getDevice();
  });

  afterAll(() => {
    device.destroy();
  });

  it('should ', () => {
    const buffer = device.createBuffer({
      viewOrSize: 8,
      usage: BufferUsage.VERTEX,
    });
    expect(buffer.type).toBe(ResourceType.Buffer);
  });
});
