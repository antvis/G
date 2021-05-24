# @antv/g-plugin-canvas-renderer

使用 WebGL 绘制各类图形：

- `init` 初始化渲染引擎，编译内置 shader
- `destroy` 销毁渲染引擎，释放纹理等 GPU 资源
- `mounted` 创建待渲染 Model
- `beginFrame` 创建 FrameGraph
- `renderFrame` 渲染 FrameGraph，调用 Model 完成渲染
- `attributeChanged` 更新 Model
