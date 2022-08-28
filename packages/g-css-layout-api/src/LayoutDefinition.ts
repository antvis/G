import type { FragmentResult, FragmentResultOptions } from './FragmentResult';
import type { LayoutChildren } from './LayoutChildren';
import type { LayoutEdges } from './LayoutEdges';
import type { IntrinsicSizes, LayoutConstraints, LayoutOptions } from './types';

export abstract class AbstractLayoutDefinition {
  static inputProperties: string[];
  static childrenInputProperties: string[];
  static layoutOptions: LayoutOptions;

  abstract intrinsicSizes(
    children: LayoutChildren[],
    edges: LayoutEdges,
    styleMap: Map<string, any>,
  ): Promise<IntrinsicSizes>;
  // abstract intrinsicSizes(
  //   children: LayoutChildren[],
  //   edges: LayoutEdges,
  //   styleMap: StylePropertyMap,
  // ): Generator<any, IntrinsicSizes, any>;
  abstract layout(
    children: LayoutChildren[],
    edges: LayoutEdges,
    constraints: LayoutConstraints,
    styleMap: Map<string, any>,
  ): Promise<FragmentResultOptions | FragmentResult>;
  // abstract layout(
  //   children: LayoutChildren[],
  //   edges: LayoutEdges,
  //   constraints: LayoutConstraints,
  //   styleMap: StylePropertyMap,
  // ): Generator<any, FragmentResultOptions | FragmentResult, any>;
}

// type Newable<T> = new (...args: any[]) => T;

// export type LayoutDefinitionCtor = Newable<AbstractLayoutDefinition>;

/**
 * internal use
 */
// https://stackoverflow.com/questions/39392853/is-there-a-type-for-class-in-typescript-and-does-any-include-it
export type LayoutDefinitionCtor = {
  new (): AbstractLayoutDefinition;
  inputProperties: string[];
  childrenInputProperties: string[];
  layoutOptions: LayoutOptions;
};
