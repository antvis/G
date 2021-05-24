export class FrameGraphHandle {
  // 保存 fg 中 resourceNodes 索引
  public index: number;
}

export interface TextureDescriptor {
  width: number;
  height: number;
  usage?: number;
}
