# @antv/g-plugin-device-renderer

-   `/platform` HAL 硬件适配层
-   `/render` 实现 FrameGraph
-   `/geometries` 提供基础几何定义
-   `/materials` 提供基础材质
-   `/meshes` 提供内置 2D 图形所需 Mesh

## 扩展点

### DeviceContribution

```js
import { DeviceContribution } from '@antv/g-plugin-device-renderer';

@singleton({
    token: DeviceContribution,
})
export class WebGLDeviceContribution implements DeviceContribution {
    async createSwapChain($canvas: HTMLCanvasElement) {
        // 创建基于 WebGL 的 Device
    }
}
```
