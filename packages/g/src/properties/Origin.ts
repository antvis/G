import type { DisplayObject } from '../DisplayObject';
import type { StylePropertyHandler } from '.';
import { inject, injectable } from 'inversify';
import type { vec2, vec3 } from 'gl-matrix';
import { SceneGraphService } from '../services';

/**
 * @see /zh/docs/api/animation#%E8%B7%AF%E5%BE%84%E5%8A%A8%E7%94%BB
 */
@injectable()
export class Origin implements StylePropertyHandler<vec2 | vec3, DisplayObject> {
  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  update(oldValue: vec2 | vec3, value: vec2 | vec3, object: DisplayObject) {
    this.sceneGraphService.setOrigin(object, value[0], value[1], value[2]);
  }
}