# g-plugin-webgpu-device

使用 WebGPU 提供 GPUDevice 能力。

目前通过 Open trial token 使用： https://developer.chrome.com/origintrials/#/registration/3817785846614982657

Vertex / Fragment Shader 使用 wgpu naga 生成 wasm，运行时异步加载，将 GLSL 300 转译成 WGSL。 Compute Shader 直接使用 WGSL。
