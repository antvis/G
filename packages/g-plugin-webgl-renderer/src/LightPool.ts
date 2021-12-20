import { singleton } from 'mana-syringe';
import { Light } from './lights';

@singleton()
export class LightPool {
  private cache: Light[] = [];

  addLight(light: Light) {
    this.cache.push(light);
  }

  getAll() {
    return this.cache;
  }
}
