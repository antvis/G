import { Component, ComponentConstructor } from './Component';
import { Entity } from './Entity';

interface IMatcher {
  matches(entity: Entity): boolean;
}

interface ICompoundMatcher<C extends Component> extends IMatcher {
  allOfComponentCtors: ComponentConstructor<C>[];
  anyOfComponentCtors: ComponentConstructor<C>[];
  noneOfComponentCtors: ComponentConstructor<C>[];
}

interface INoneOfMatcher<C extends Component> extends ICompoundMatcher<C> {}

interface IAnyOfMatcher<C extends Component> extends ICompoundMatcher<C> {
  noneOf(...clazzes: ComponentConstructor<C>[]): INoneOfMatcher<C>;
}

interface IAllOfMatcher<C extends Component> extends ICompoundMatcher<C> {
  anyOf(...clazzes: ComponentConstructor<C>[]): IAnyOfMatcher<C>;
  noneOf(...clazzes: ComponentConstructor<C>[]): INoneOfMatcher<C>;
}

/**
 * Query language of ECS
 * @see https://github.com/mzaks/EntitasCookBook/blob/master/chapters/1_ingredients/104_group.md#matcher
 * @example
 * ```
 * matcher.allOf(Position, Velocity).noneOf(NotMovable)
 * ```
 */
export class Matcher<C extends Component = Component> implements IAllOfMatcher<C>, IAnyOfMatcher<C>, INoneOfMatcher<C> {
  public allOfComponentCtors: ComponentConstructor<C>[] = [];
  public anyOfComponentCtors: ComponentConstructor<C>[] = [];
  public noneOfComponentCtors: ComponentConstructor<C>[] = [];

  public allOf(...clazzes: ComponentConstructor<C>[]): Matcher<C> {
    this.allOfComponentCtors = clazzes;
    return this;
  }

  public anyOf(...clazzes: ComponentConstructor<C>[]): Matcher<C> {
    this.anyOfComponentCtors = clazzes;
    return this;
  }

  public noneOf(...clazzes: ComponentConstructor<C>[]): Matcher<C> {
    this.noneOfComponentCtors = clazzes;
    return this;
  }

  public matches(entity: Entity): boolean {
    const matchesAllOf = !this.allOfComponentCtors.length ? true : entity.hasAllComponents(this.allOfComponentCtors);
    const matchesAnyOf = !this.anyOfComponentCtors.length ? true : entity.hasAnyComponents(this.anyOfComponentCtors);
    const matchesNoneOf = !this.noneOfComponentCtors.length
      ? true
      : !entity.hasAnyComponents(this.noneOfComponentCtors);
    return matchesAllOf && matchesAnyOf && matchesNoneOf;
  }
}
