import { inject, singleton } from '@antv/g';
import { RenderHelper } from './RenderHelper';

@singleton()
export class PostProcessingManager {
  @inject(RenderHelper)
  private renderHelper: RenderHelper;
}
