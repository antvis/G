import { inject, singleton } from 'mana-syringe';
import { RenderHelper } from './RenderHelper';

@singleton()
export class PostProcessingManager {
  @inject(RenderHelper)
  private renderHelper: RenderHelper;
}
