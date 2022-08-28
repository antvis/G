import { GlobalContainer } from 'mana-syringe';
import RBush from 'rbush';
import 'reflect-metadata';
import { StyleValueRegistry } from './css';
import { containerModule as globalModule } from './global-module';

export * from 'mana-syringe';
export * from './AbstractRenderer';
export * from './camera';
export * from './Canvas';
export * from './components';
export * from './css';
export * from './display-objects';
export * from './dom';
export * from './services';
export * from './shapes';
export * from './types';
export * from './utils';
export { RBush };

GlobalContainer.load(globalModule);

// export const sceneGraphService = GlobalContainer.get<SceneGraphService>(SceneGraphService);
export const styleValueRegistry = GlobalContainer.get<StyleValueRegistry>(StyleValueRegistry);
// export const displayObjectPool = GlobalContainer.get(DisplayObjectPool);
