import { singleton } from '@antv/g-lite';
import { DefaultRenderer } from './Default';
import { EllipseRendererContribution } from './interfaces';

@singleton({
  token: EllipseRendererContribution,
})
export class EllipseRenderer extends DefaultRenderer {}
