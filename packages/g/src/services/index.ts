/** extends by g-canvas/svg/webgl */

import { ContainerModule, interfaces } from 'inversify';
import { SHAPE } from '../types';
import { CircleUpdater, EllipseUpdater, TextUpdater, GeometryAABBUpdater, RectUpdater } from './aabb';
import { SceneGraphAdapter } from './SceneGraphAdapter';
import { SceneGraphService } from './SceneGraphService';
import { TextService } from './text';
import { OffscreenCanvasCreator } from './text/OffscreenCanvasCreator';

export * from './SceneGraphService';
export * from './ContextService';
export * from './RenderingContext';
export * from './RenderingService';
export * from './SceneGraphAdapter';
export * from './text';

export const containerModule = new ContainerModule((bind, unbind, isBound, rebind) => {});
