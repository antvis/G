import { singleton } from 'mana-syringe';
import { DefaultRenderer } from './Default';
import { EllipseRendererContribution } from './interfaces';

@singleton({
  token: EllipseRendererContribution,
})
export class EllipseRenderer extends DefaultRenderer {}
