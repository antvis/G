import type { Fog, Light } from './lights';

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

  /**
   * USE_LIGHT
   * NUM_AMBIENT_LIGHTS
   * NUM_DIR_LIGHTS
   */
  getDefines(): Record<string, number | boolean> {
    const defines = {
      USE_LIGHT: !!this.lights.length,
    };
    this.lights.forEach((light) => {
      if (!defines[light.define]) {
        defines[light.define] = 0;
      }

      defines[light.define]++;
    });

    return defines;
  }

  private sortLights() {
    this.lights.sort((a, b) => a.order - b.order);
  }
}
