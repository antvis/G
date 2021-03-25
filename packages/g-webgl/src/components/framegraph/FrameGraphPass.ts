import { Entity } from '@antv/g-ecs';
import { FrameGraphEngine } from '../../contributions/FrameGraphEngine';

export class FrameGraphPass<PassData> {
  public name: string;

  public data: PassData;

  public execute: (fg: FrameGraphEngine, pass: FrameGraphPass<PassData>, entities: Entity[]) => Promise<void>;

  public tearDown: () => void;
}
