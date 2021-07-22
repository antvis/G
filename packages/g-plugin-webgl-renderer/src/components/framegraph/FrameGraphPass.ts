import { FrameGraphEngine } from '../../FrameGraphEngine';

export class FrameGraphPass<PassData> {
  name: string;

  data: PassData;

  execute: (fg: FrameGraphEngine, pass: FrameGraphPass<PassData>) => void;

  tearDown: () => void;
}
