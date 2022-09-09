import { inject, singleton } from '@antv/g-lite';
import { RenderHelper } from './RenderHelper';

@singleton()
export class PostProcessingManager {
  constructor(
    @inject(RenderHelper)
    private renderHelper: RenderHelper,
  ) {}
}
