import { singleton } from '@antv/g';
import { DefaultRenderer } from './Default';
import { RectRendererContribution } from './interfaces';

@singleton({
  token: RectRendererContribution,
})
export class RectRenderer extends DefaultRenderer {}
