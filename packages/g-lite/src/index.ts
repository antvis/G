import { GlobalContainer } from 'mana-syringe';
import RBush from 'rbush';
import { StyleValueRegistry } from './css';
import { containerModule as globalModule } from './global-module';

export { GlobalContainer, inject, injectable, Module, singleton, Syringe } from 'mana-syringe';
export * from './AbstractRenderer';
export * from './camera';
export * from './Canvas';
export * from './components';
export {
  CSS,
  CSSGradientValue,
  CSSKeywordValue,
  CSSRGB,
  CSSStyleValue,
  CSSUnitValue,
  GradientType,
  Interpolatable,
  isPattern,
  LayoutRegistry,
  LinearGradient,
  parseColor,
  parsePath,
  parseLength,
  mergeColors,
  Pattern,
  propertyMetadataCache,
  PropertySyntax,
  RadialGradient,
  StyleValueRegistry,
  UnitType,
  BUILT_IN_PROPERTIES,
} from './css';
export * from './display-objects';
export * from './dom';
export * from './services';
export * from './shapes';
export * from './types';
export {
  computeLinearGradient,
  computeRadialGradient,
  convertToPath,
  deg2rad,
  deg2turn,
  ERROR_MSG_METHOD_NOT_IMPLEMENTED,
  getEuler,
  grad2deg,
  isBrowser,
  isFillOrStrokeAffected,
  rad2deg,
  setDOMSize,
  translatePathToString,
  turn2deg,
  getAngle,
  createVec3,
  findClosestClipPathTarget,
  getOrCalculatePathTotalLength,
} from './utils';
export { RBush };

GlobalContainer.load(globalModule);

// export const sceneGraphService = GlobalContainer.get<SceneGraphService>(SceneGraphService);
export const styleValueRegistry = GlobalContainer.get<StyleValueRegistry>(StyleValueRegistry);
// export const displayObjectPool = GlobalContainer.get(DisplayObjectPool);
