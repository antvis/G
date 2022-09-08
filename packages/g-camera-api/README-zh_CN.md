[English](./README.md) | 简体中文

提供高级相机功能，包括完整相机动作和动画。

### 使用方式

`@antv/g` 已经内置，搭配精简版使用方式如下：

```js
import '@antv/g-lite';
import '@antv/g-camera-api';
```

随后即可从画布中获取相机，执行相机动作：

```js
const camera = canvas.getCamera();
camera.pan(100, 20);
```

### API

#### 相机动作

在相机坐标系中相机的三轴为 uvn，相机动作实际就是沿这三轴进行移动和旋转。

https://g-next.antv.vision/zh/docs/api/camera#%E7%9B%B8%E6%9C%BA%E5%8A%A8%E4%BD%9C

#### 相机动画

我们可以把相机当前的位置、视点记录下来，保存成一个"地标" Landmark。随后当相机参数发生改变时，可以随时切换到之前保存的任意一个 Landmark，同时带有平滑的切换动画，类似真实片场中的摄像机摇臂，在一些应用中也称作 flyTo。

https://g-next.antv.vision/zh/docs/api/camera#%E7%9B%B8%E6%9C%BA%E5%8A%A8%E7%94%BB
