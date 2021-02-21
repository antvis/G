import { injectable } from 'inversify';
import { Component } from './Component';
import { Entity } from './Entity';
import { Matcher } from './Matcher';

/**
 * inspired by Entitas' Systems
 * @see https://github.com/sschmid/Entitas-CSharp/wiki/Systems
 */
export interface ISystem {
  priority: number;

  /**
   * in a similar way to Unity's `Start()`, we can do some initialization works:
   * * create global entities
   * * init event listeners
   */
  initialize?(): Promise<void> | void;
  initialized: boolean;

  /**
   * in a similar way to Unity's `Update()`, run once per frame
   */
  execute?(entities: Entity[]): Promise<void> | void;

  /**
   * run once at the end of your program
   */
  tearDown?(): Promise<void> | void;

  /**
   * all kind of components this system cares about
   */
  trigger?<C extends Component>(): Matcher<C>;

  onEntityAdded?(entity: Entity): void;
  onEntityRemoved?(entity: Entity): void;
}

export interface SystemConstructor<T extends System> {
  tag: string;
  new (...args: any): T;
}

@injectable()
export abstract class System implements ISystem {
  static tag: string;

  readonly priority: number;

  public initialized = false;
  private enabled = false;
  private executeTime: number;

  public stop() {
    this.executeTime = 0;
    this.enabled = false;
  }

  public play() {
    this.enabled = true;
  }
}
