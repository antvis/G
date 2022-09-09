import { singleton } from '@antv/g-lite';
import { DefaultRenderer } from './Default';
import { CircleRendererContribution } from './interfaces';

@singleton({
  token: CircleRendererContribution,
})
export class CircleRenderer extends DefaultRenderer {}
