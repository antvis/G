import { Entity } from './Entity';
import { Matcher } from './Matcher';

export const System = 'System';
/**
 * inspired by Entitas' Systems
 * @see https://github.com/sschmid/Entitas-CSharp/wiki/Systems
 */
export interface System {
  /**
   * in a similar way to Unity's `Start()`, we can do some initialization works:
   * * create global entities
   * * init event listeners
   */
  initialize?(): void;
  initialized?: boolean;

  /**
   * in a similar way to Unity's `Update()`, run once per frame
   */
  execute(entities: Entity[], delta?: number, millis?: number): void;

  /**
   * run once at the end of your program
   */
  tearDown?(entities: Entity[]): void;

  onEntityAdded?(entity: Entity): void;
  onEntityRemoved?(entity: Entity): void;
}

export interface SystemConstructor<T extends System> {
  /**
   * all kind of components this system cares about
   */
  trigger?: Matcher;
  priority?: number;
  new (...args: any): T;
}
