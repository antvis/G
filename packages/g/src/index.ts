import 'reflect-metadata';
import * as ManaSyringe from 'mana-syringe';
import { containerModule as globalModule } from './global-module';
import { GlobalContainer } from 'mana-syringe';
import { LayoutEngine } from './css/layout';

export { ManaSyringe };

GlobalContainer.load(globalModule);

const layoutEngine = GlobalContainer.get(LayoutEngine);
export { layoutEngine };

export * from './types';
export * from './css';
export * from './dom';
export * from './camera';
export * from './display-objects';
export * from './components';
export * from './AbstractRenderer';
export * from './Canvas';
export * from './DisplayObjectPool';
export * from './services';
export * from './shapes';
export * from './utils';
