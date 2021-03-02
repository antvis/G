import { Entity } from '@antv/g-ecs';
import { FrameGraphSystem } from '../../systems/FrameGraph';

export class FrameGraphPass<PassData> {
  public name: string;

  public data: PassData;

  public execute: (fg: FrameGraphSystem, pass: FrameGraphPass<PassData>, entities: Entity[]) => Promise<void>;

  public tearDown: () => void;
}
