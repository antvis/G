import { singleton } from '@antv/g-lite';
import { DefaultRenderer } from './Default';
import { PolygonRendererContribution } from './interfaces';

@singleton({
  token: PolygonRendererContribution,
})
export class PolygonRenderer extends DefaultRenderer {}
