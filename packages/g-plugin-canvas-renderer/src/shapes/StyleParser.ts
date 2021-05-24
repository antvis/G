// import { ContextService } from '@antv/g';
import { inject, injectable } from 'inversify';

@injectable()
export class StyleParser {
  // @inject(ContextService)
  // protected contextService: ContextService<CanvasRenderingContext2D>;

  parse(color: string): string {
    // if (color[1] === '(' || color[2] === '(') {
    //   if (color[0] === 'l') {
    //     // regexLG.test(color)
    //     return parseLineGradient(context, element, color);
    //   }
    //   if (color[0] === 'r') {
    //     // regexRG.test(color)
    //     return parseRadialGradient(context, element, color);
    //   }
    //   if (color[0] === 'p') {
    //     // regexPR.test(color)
    //     return parsePattern(context, element, color);
    //   }
    // }
    return color;
  }
}
