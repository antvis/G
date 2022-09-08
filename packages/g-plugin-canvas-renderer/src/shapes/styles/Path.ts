import { singleton } from '@antv/g-lite';
import { DefaultRenderer } from './Default';
import { PathRendererContribution } from './interfaces';

@singleton({
  token: PathRendererContribution,
})
export class PathRenderer extends DefaultRenderer {}
