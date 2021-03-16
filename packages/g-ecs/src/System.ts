import { Entity } from './Entity';
import { Matcher } from './Matcher';

export const System = Symbol('System');
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
  initialize?(): Promise<void> | void;
  initialized?: boolean;

  /**
   * in a similar way to Unity's `Update()`, run once per frame
   */
  execute(entities: Entity[], delta?: number, millis?: number): Promise<void> | void;

  /**
   * run once at the end of your program
   */
  tearDown?(entities: Entity[]): Promise<void> | void;

  onEntityAdded?(entity: Entity): void;
  onEntityRemoved?(entity: Entity): void;
}

export interface SystemConstructor<T extends System> {
  tag: string;
  /**
   * all kind of components this system cares about
   */
  trigger?: Matcher;
  priority?: number;
  new (...args: any): T;
}
