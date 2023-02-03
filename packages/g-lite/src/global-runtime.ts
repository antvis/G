import type { LayoutRegistry } from './css';
import type { CSSProperty } from './css/CSSProperty';
import { PropertySyntax } from './css/interfaces';
import { DefaultStyleValueRegistry } from './css/StyleValueRegistry';
import {
  CSSPropertyAngle,
  CSSPropertyClipPath,
  CSSPropertyColor,
  CSSPropertyFilter,
  CSSPropertyLengthOrPercentage,
  CSSPropertyLengthOrPercentage12,
  CSSPropertyLengthOrPercentage14,
  CSSPropertyLocalPosition,
  CSSPropertyMarker,
  CSSPropertyNumber,
  CSSPropertyOffsetDistance,
  CSSPropertyOpacity,
  CSSPropertyPath,
  CSSPropertyPoints,
  CSSPropertyShadowBlur,
  CSSPropertyText,
  CSSPropertyTextTransform,
  CSSPropertyTransform,
  CSSPropertyTransformOrigin,
  CSSPropertyZIndex,
} from './css/properties';
import { DisplayObjectPool } from './display-objects';
import { Camera } from './camera';
import type {
  GeometryAABBUpdater,
  SceneGraphSelector,
  SceneGraphService,
} from './services';
import {
  CircleUpdater,
  DefaultSceneGraphSelector,
  DefaultSceneGraphService,
  EllipseUpdater,
  LineUpdater,
  OffscreenCanvasCreator,
  PathUpdater,
  PolylineUpdater,
  RectUpdater,
  TextService,
  TextUpdater,
} from './services';
import { Shape } from './types';

export const runtime: GlobalRuntime = {} as GlobalRuntime;

export interface GlobalRuntime {
  CameraContribution: new () => Camera;
  // AnimationTimeline: new (doc: IDocument) => IAnimationTimeline;
  AnimationTimeline: any;
  EasingFunction: (...args: any[]) => (t: number) => number;
  displayObjectPool: DisplayObjectPool;
  offscreenCanvas: OffscreenCanvasCreator;
  sceneGraphSelector: SceneGraphSelector;
  sceneGraphService: SceneGraphService;
  textService: TextService;
  geometryUpdaterFactory: Record<Shape, GeometryAABBUpdater<any>>;
  styleValueRegistry: DefaultStyleValueRegistry;
  layoutRegistry: LayoutRegistry;
  CSSPropertySyntaxFactory: Record<
    PropertySyntax,
    Partial<CSSProperty<any, any>>
  >;
  globalThis: any;
  enableCSSParsing: boolean;
}

/**
 * Replace with IoC container
 */
const geometryUpdaterFactory: Record<Shape, GeometryAABBUpdater<any>> = (() => {
  const rectUpdater = new RectUpdater();
  const polylineUpdater = new PolylineUpdater();
  return {
    [Shape.CIRCLE]: new CircleUpdater(),
    [Shape.ELLIPSE]: new EllipseUpdater(),
    [Shape.RECT]: rectUpdater,
    [Shape.IMAGE]: rectUpdater,
    [Shape.GROUP]: rectUpdater,
    [Shape.LINE]: new LineUpdater(),
    [Shape.TEXT]: new TextUpdater(runtime),
    [Shape.POLYLINE]: polylineUpdater,
    [Shape.POLYGON]: polylineUpdater,
    [Shape.PATH]: new PathUpdater(),
    [Shape.HTML]: null,
    [Shape.MESH]: null,
  };
})();

const CSSPropertySyntaxFactory: Record<
  PropertySyntax,
  Partial<CSSProperty<any, any>>
> = (() => {
  const color = new CSSPropertyColor();
  const length = new CSSPropertyLengthOrPercentage();
  return {
    [PropertySyntax.PERCENTAGE]: null,
    [PropertySyntax.NUMBER]: new CSSPropertyNumber(),
    [PropertySyntax.ANGLE]: new CSSPropertyAngle(),
    [PropertySyntax.DEFINED_PATH]: new CSSPropertyClipPath(),
    [PropertySyntax.PAINT]: color,
    [PropertySyntax.COLOR]: color,
    [PropertySyntax.FILTER]: new CSSPropertyFilter(),
    [PropertySyntax.LENGTH]: length,
    [PropertySyntax.LENGTH_PERCENTAGE]: length,
    [PropertySyntax.LENGTH_PERCENTAGE_12]:
      new CSSPropertyLengthOrPercentage12(),
    [PropertySyntax.LENGTH_PERCENTAGE_14]:
      new CSSPropertyLengthOrPercentage14(),
    [PropertySyntax.COORDINATE]: new CSSPropertyLocalPosition(),
    [PropertySyntax.OFFSET_DISTANCE]: new CSSPropertyOffsetDistance(),
    [PropertySyntax.OPACITY_VALUE]: new CSSPropertyOpacity(),
    [PropertySyntax.PATH]: new CSSPropertyPath(),
    [PropertySyntax.LIST_OF_POINTS]: new CSSPropertyPoints(),
    [PropertySyntax.SHADOW_BLUR]: new CSSPropertyShadowBlur(),
    [PropertySyntax.TEXT]: new CSSPropertyText(),
    [PropertySyntax.TEXT_TRANSFORM]: new CSSPropertyTextTransform(),
    [PropertySyntax.TRANSFORM]: new CSSPropertyTransform(),
    [PropertySyntax.TRANSFORM_ORIGIN]: new CSSPropertyTransformOrigin(),
    [PropertySyntax.Z_INDEX]: new CSSPropertyZIndex(),
    [PropertySyntax.MARKER]: new CSSPropertyMarker(),
  };
})();

const getGlobalThis = () => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  // @ts-ignore
  if (typeof global !== 'undefined') return global;
  if (typeof this !== 'undefined') return this;
  throw new Error('Unable to locate global `this`');
};

/**
 * Camera
 * `g-camera-api` will provide an advanced implementation
 */
runtime.CameraContribution = Camera;

/**
 * `g-web-animations-api` will provide an AnimationTimeline
 */
runtime.AnimationTimeline = null;

runtime.EasingFunction = null;

runtime.offscreenCanvas = new OffscreenCanvasCreator();

runtime.displayObjectPool = new DisplayObjectPool();

runtime.sceneGraphSelector = new DefaultSceneGraphSelector();

runtime.sceneGraphService = new DefaultSceneGraphService(runtime);

runtime.textService = new TextService(runtime);

runtime.geometryUpdaterFactory = geometryUpdaterFactory;

runtime.CSSPropertySyntaxFactory = CSSPropertySyntaxFactory;
runtime.styleValueRegistry = new DefaultStyleValueRegistry();
runtime.layoutRegistry = null;
runtime.globalThis = getGlobalThis();
