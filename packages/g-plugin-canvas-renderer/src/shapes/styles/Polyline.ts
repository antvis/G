import { singleton } from 'mana-syringe';
import { DefaultRenderer } from './Default';
import { PolylineRendererContribution } from './interfaces';

@singleton({
  token: PolylineRendererContribution,
})
export class PolylineRenderer extends DefaultRenderer {}
