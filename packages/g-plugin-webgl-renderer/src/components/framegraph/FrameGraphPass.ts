import { DisplayObject } from '@antv/g';
import { FrameGraphEngine } from '../../FrameGraphEngine';

export class FrameGraphPass<PassData> {
  public name: string;

  public data: PassData;

  public execute: (fg: FrameGraphEngine, pass: FrameGraphPass<PassData>, displayObjects: DisplayObject[]) => void;

  public tearDown: () => void;
}
