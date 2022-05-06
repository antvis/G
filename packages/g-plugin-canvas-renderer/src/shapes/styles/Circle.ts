import { singleton } from 'mana-syringe';
import { DefaultRenderer } from './Default';
import { CircleRendererContribution } from './interfaces';

@singleton({
  token: CircleRendererContribution,
})
export class CircleRenderer extends DefaultRenderer {}
