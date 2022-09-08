import { GlobalContainer } from '@antv/g-lite';
import { containerModule } from './global-module';

export * from './dom';
// export * from './utils';

GlobalContainer.load(containerModule);
