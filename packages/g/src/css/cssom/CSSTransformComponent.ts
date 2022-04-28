export enum TransformComponentType {
  kMatrixType,
  kPerspectiveType,
  kRotationType,
  kScaleType,
  kSkewType,
  kSkewXType,
  kSkewYType,
  kTranslationType,
}

/**
 * CSSTransformComponent is the base class used for the representations of
 * the individual CSS transforms. They are combined in a CSSTransformValue
 * before they can be used as a value for properties like "transform".
 *
 * @see https://drafts.css-houdini.org/css-typed-om/#csstransformcomponent
 */
export abstract class CSSTransformComponent {
  constructor(public is2D: boolean) {}

  abstract toMatrix(): DOMMatrix;
}
