import { Entity } from '@antv/g-ecs';
import { FrameGraphEngine } from '../../plugins/FrameGraphEngine';

export class FrameGraphPass<PassData> {
  public name: string;

  public data: PassData;

  public execute: (fg: FrameGraphEngine, pass: FrameGraphPass<PassData>, entities: Entity[]) => void;

  public tearDown: () => void;
}
