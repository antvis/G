import { RenderingEngine } from '../../services/renderer';
import { PassNode } from './PassNode';

/**
 * ported from filament
 */
export abstract class VirtualResource {
  public first: PassNode;
  public last: PassNode;

  public abstract preExecuteDevirtualize(engine: RenderingEngine): void;
  public abstract preExecuteDestroy(engine: RenderingEngine): void;
  public abstract postExecuteDestroy(engine: RenderingEngine): void;
  public abstract postExecuteDevirtualize(engine: RenderingEngine): void;
}
