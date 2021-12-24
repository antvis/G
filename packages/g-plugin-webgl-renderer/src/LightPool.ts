import { singleton } from 'mana-syringe';
import { Light, Fog } from './lights';

@singleton()
export class LightPool {
  /**
   * lights
   */
  private lights: Light[] = [];

  /**
   * support only 1 fog
   */
  private fog: Fog;

  addLight(light: Light) {
    this.lights.push(light);
    this.sortLights();
  }

  removeLight(light: Light) {
    const i = this.lights.indexOf(light);
    this.lights.splice(i, 1);
    this.sortLights();
  }

  addFog(fog: Fog) {
    this.fog = fog;
  }

  removeFog(fog: Fog) {
    this.fog = null;
  }

  getFog() {
    return this.fog;
  }

  getAllLights() {
    return this.lights;
  }

  private sortLights() {
    this.lights.sort((a, b) => a.order - b.order);
  }
}
