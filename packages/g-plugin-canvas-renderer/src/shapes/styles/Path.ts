import { singleton } from '@antv/g';
import { DefaultRenderer } from './Default';
import { PathRendererContribution } from './interfaces';

@singleton({
  token: PathRendererContribution,
})
export class PathRenderer extends DefaultRenderer {}
