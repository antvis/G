import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Cullable, Geometry, Renderable, SceneGraphNode, Transform } from '../../components';
import { SceneGraphService } from '../../services';
import { GeometryAABBUpdater, GeometryUpdaterFactory } from '../../services/aabb';
import { DisplayObjectHooks, DisplayObjectPlugin } from '../../hooks';
import { SHAPE, ShapeAttrs, ShapeCfg } from '../../types';

/**
 * get called before appended to Canvas
 */
@injectable()
export class InitShapePlugin implements DisplayObjectPlugin {
  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(GeometryUpdaterFactory)
  private geometryUpdaterFactory: (tagName: SHAPE) => GeometryAABBUpdater | null;

  apply() {
    DisplayObjectHooks.init.tap('InitPlugin', (entity: Entity, config: ShapeCfg) => {
      // init scene graph node
      const sceneGraphNode = entity.addComponent(SceneGraphNode);
      sceneGraphNode.id = config.id || '';
      sceneGraphNode.class = config.className || '';
      sceneGraphNode.tagName = config.type || SHAPE.Group;
      sceneGraphNode.attributes = config.attrs || {};
      if (config.name) {
        sceneGraphNode.attributes.name = config.name;
      }

      // init transform
      entity.addComponent(Transform);

      // set position in world space
      this.setPosition(entity, sceneGraphNode.attributes);

      // set origin
      const { origin = [0, 0] } = sceneGraphNode.attributes;
      this.sceneGraphService.setOrigin(entity, [...origin, 0]);

      // visible: true -> visibility: visible
      // visible: false -> visibility: hidden
      if (config.visible === false) {
        sceneGraphNode.attributes.visibility = 'hidden';
      } else {
        sceneGraphNode.attributes.visibility = 'visible';
      }

      // only shape can be rendered
      entity.addComponent(Renderable);
      entity.addComponent(Cullable);

      // calculate AABB for current geometry
      const geometry = entity.addComponent(Geometry);
      const updater = this.geometryUpdaterFactory(sceneGraphNode.tagName);
      if (updater) {
        updater.update(sceneGraphNode.attributes, geometry.aabb);
        this.sceneGraphService.updateRenderableAABB(entity);
      }
    });
  }

  private setPosition(entity: Entity, attributes: ShapeAttrs) {
    const { tagName } = entity.getComponent(SceneGraphNode);

    if (tagName === SHAPE.Line) {
      const { x1, y1, x2, y2 } = attributes;
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      attributes.width = maxX - minX;
      attributes.height = maxY - minY;
      this.sceneGraphService.setPosition(entity, minX, minY);
    } else {
      // set position in world space
      const { x = 0, y = 0 } = attributes;
      this.sceneGraphService.setPosition(entity, x, y);
    }
  }
}
