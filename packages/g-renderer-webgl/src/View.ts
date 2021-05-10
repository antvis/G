import { injectable } from 'inversify';
import { ICamera, IView, IViewport } from './services/renderer';

export const Views = Symbol('Views');

@injectable()
export class View implements IView {
  // @inject(IDENTIFIER.Systems)
  // @named(IDENTIFIER.RendererSystem)
  // private readonly rendererSystem: RendererSystem;

  private camera: ICamera;
  // private scene: IScene;
  private viewport: IViewport = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  // private clearColor: [number, number, number, number] = [1, 1, 1, 1];
  private clearColor: [number, number, number, number] = [0, 0, 0, 0];

  public getCamera() {
    return this.camera;
  }

  // public getScene() {
  //   return this.scene;
  // }

  public getViewport() {
    return this.viewport;
  }

  public getClearColor() {
    return this.clearColor;
  }

  public setCamera(camera: ICamera) {
    this.camera = camera;
    return this;
  }

  // public setScene(scene: IScene) {
  //   this.scene = scene;
  //   return this;
  // }

  public setViewport(viewport: IViewport) {
    this.viewport = viewport;
    return this;
  }

  public setClearColor(clearColor: [number, number, number, number]) {
    this.clearColor = clearColor;
    return this;
  }

  public pick(position: { x: number; y: number }) {
    // return this.rendererSystem.pick(position, this);
    return undefined;
  }
}
