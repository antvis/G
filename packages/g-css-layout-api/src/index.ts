import { GlobalContainer } from '@antv/g-lite';
import { containerModule } from './global-module';
import { LayoutEngine } from './LayoutEngine';

export * from './FragmentResult';
export * from './LayoutChildren';
export * from './LayoutContext';
export * from './LayoutDefinition';
export * from './LayoutEdges';
export * from './LayoutEngine';
export * from './LayoutFragment';
export * from './LayoutObject';
export * from './LayoutRegistry';
export * from './LayoutWorkTask';
export * from './types';

GlobalContainer.load(containerModule);
export const layoutEngine = GlobalContainer.get(LayoutEngine);
