import { singleton } from 'mana-syringe';
import { DefaultRenderer } from './Default';
import { LineRendererContribution } from './interfaces';

@singleton({
  token: LineRendererContribution,
})
export class LineRenderer extends DefaultRenderer {}
