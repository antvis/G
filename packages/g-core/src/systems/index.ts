import { ContainerModule, interfaces } from 'inversify';
import { bindContributionProvider } from '../contribution-provider';
import { CullingStrategy, DefaultCullingStrategy } from './Culling';
import { DefaultShapeRenderer, RendererFrameContribution, ShapeRenderer, ShapeRendererFactory } from './Renderer';
import {
  AttributeAnimationUpdaters,
  ColorAttributeAnimationUpdater,
  DefaultAttributeAnimationUpdater,
} from './Timeline';

const systemModule = new ContainerModule((bind) => {
  // shape handlers
  bind(DefaultShapeRenderer).toSelf().inSingletonScope();

  // shape renderer factory
  bind<interfaces.Factory<ShapeRenderer>>(ShapeRendererFactory).toFactory<ShapeRenderer | null>(
    (context: interfaces.Context) => {
      const cache: Record<string, ShapeRenderer> = {};
      return (shapeType: string) => {
        if (cache[shapeType]) {
          return cache[shapeType];
        }

        try {
          const isShapeRendererBound = context.container.isBoundNamed(ShapeRenderer, shapeType);
          if (!isShapeRendererBound) {
            console.error(`Missing renderer for ${shapeType} shape, please bind one first.`);
            return null;
          }
        } catch (e) {
          //
        }

        const renderer = context.container.getNamed<ShapeRenderer>(ShapeRenderer, shapeType);
        cache[shapeType] = renderer;
        return renderer;
      };
    }
  );

  // culling strategies
  bindContributionProvider(bind, CullingStrategy);
  bind(DefaultCullingStrategy).toSelf().inSingletonScope();
  bind(CullingStrategy).toService(DefaultCullingStrategy);

  // renderer begin/end frame handlers
  bindContributionProvider(bind, RendererFrameContribution);

  bind(DefaultAttributeAnimationUpdater).toSelf().inSingletonScope();
  bind(ColorAttributeAnimationUpdater).toSelf().inSingletonScope();
  bind(AttributeAnimationUpdaters).to(DefaultAttributeAnimationUpdater);
  bind(AttributeAnimationUpdaters).to(ColorAttributeAnimationUpdater);
});

// export * from './AABB';
export * from './Culling';
export * from './SceneGraph';
export * from './Context';
export * from './Renderer';
export { systemModule };
