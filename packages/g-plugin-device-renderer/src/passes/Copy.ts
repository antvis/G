// import { BufferGeometry } from '../geometries';
// import { Format, InputLayout, InputState, VertexStepMode } from '../platform';
// import { fullscreenMegaState, nArray } from '../platform/utils';
import { DeviceProgram } from '../render/DeviceProgram';
// import { RGAttachmentSlot, RGGraphBuilder } from '../render/interfaces';
// import { RenderHelper } from '../render/RenderHelper';
// import { TextureMapping } from '../render/TextureHolder';
// import { fillVec4, ShaderLibrary } from '../render/utils';
import vert from '../shader/passes/fullscreen.vert';
import frag from '../shader/passes/copy.frag';

export class CopyProgram extends DeviceProgram {
  vert = vert;
  frag = frag;

  features = {};
}

// interface RenderInput {
//   backbufferWidth: number;
//   backbufferHeight: number;
// }

// const textureMapping = nArray(1, () => new TextureMapping());
// let geometry: Geometry;
// let inputState: InputState;
// let inputLayout: InputLayout;

// export function useCopyPass(
//   // builder: RGGraphBuilder,
//   renderHelper: RenderHelper,
//   // renderInput: RenderInput,
//   // mainColorTargetID: number,
// ): void {
//   // const mainColorResolveTextureID = builder.resolveRenderTarget(mainColorTargetID);
//   // pass.attachResolveTexture(mainColorResolveTextureID);

//   const renderInst = renderHelper.renderInstManager.newRenderInst();
//   renderInst.setUniformBuffer(renderHelper.uniformBuffer);
//   renderInst.setAllowSkippingIfPipelineNotReady(false);

//   renderInst.setMegaStateFlags(fullscreenMegaState);
//   renderInst.setBindingLayouts([{ numUniformBuffers: 0, numSamplers: 1 }]);
//   renderInst.drawPrimitives(3);

//   const copyProgram = new CopyProgram();
//   const program = renderHelper.renderCache.createProgram(copyProgram);

//   renderInst.setProgram(program);

//   if (!geometry) {
//     geometry = new Geometry();
//     geometry.device = renderHelper.getDevice();
//     geometry.setVertexBuffer({
//       bufferIndex: 0,
//       byteStride: 4 * 2,
//       stepMode: VertexStepMode.VERTEX,
//       attributes: [
//         {
//           format: Format.F32_RG,
//           bufferByteOffset: 4 * 0,
//           location: 0,
//         },
//       ],
//       // rendering a fullscreen triangle instead of quad
//       // @see https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/
//       data: new Float32Array([-4, -4, 4, -4, 0, 4]),
//     });
//     geometry.vertexCount = 3;

//     inputLayout = renderHelper.getCache().createInputLayout(geometry.inputLayoutDescriptor);

//     inputState = renderHelper.getDevice().createInputState(
//       inputLayout,
//       geometry.vertexBuffers.map((buffer) => ({
//         buffer,
//         byteOffset: 0,
//       })),
//       null,
//       program,
//     );
//   }

//   // textureMapping[0].texture = scope.getResolveTextureForID(mainColorResolveTextureID);
//   // renderInst.setSamplerBindingsFromTextureMappings(textureMapping);
//   renderInst.setInputLayoutAndState(inputLayout, inputState);

//   renderInst.drawPrimitives(3);
// }
