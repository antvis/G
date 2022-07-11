import { GlobalContainer } from 'mana-syringe';
import RBush from 'rbush';
import 'reflect-metadata';
import { LayoutEngine } from './css/layout';
import { containerModule as globalModule } from './global-module';

export * from 'mana-syringe';
export * from './AbstractRenderer';
export * from './camera';
export * from './Canvas';
export * from './components';
export * from './css';
export * from './display-objects';
export * from './DisplayObjectPool';
export * from './dom';
export * from './services';
export * from './shapes';
export * from './types';
export * from './utils';
export { RBush, layoutEngine };

GlobalContainer.load(globalModule);

const layoutEngine = GlobalContainer.get(LayoutEngine);
