import * as ManaSyringe from 'mana-syringe';
import { containerModule as globalModule, globalContainer } from './global-module';

export { ManaSyringe };

// bind ECS
globalContainer.load(globalModule);

export * from './types';
export * from './components';
export * from './dom';
export * from './AbstractRenderer';
export * from './Canvas';
export * from './DisplayObjectPool';
export * from './camera';
export * from './services';
export * from './shapes';
export * from './utils';
export * from './property-handlers';
export * from './display-objects';
export * from './global-module';
