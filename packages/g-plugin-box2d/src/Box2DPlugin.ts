import { inject, singleton } from 'mana-syringe';
import {
  DisplayObjectPool,
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
  SceneGraphService,
  RenderingContext,
  ElementEvent,
  DisplayObject,
  CanvasEvent,
  SHAPE,
  ParsedLineStyleProps,
  ParsedPolylineStyleProps,
  ParsedCircleStyleProps,
  ParsedRectStyleProps,
  ParsedBaseStyleProps,
  rad2deg,
  deg2rad,
} from '@antv/g';
import type { Element, FederatedEvent } from '@antv/g';
import type Box2DFactory from 'box2d-wasm';
import { Box2DPluginOptions } from './tokens';
import { createChainShape, createPolygonShape, sortPointsInCCW } from './utils';

// v2.4
const BOX2D_UMD_DIR = 'https://unpkg.com/box2d-wasm@7.0.0/dist/umd/';

// v2.3
// enum Box2DUrl {
//   JS = 'http://kripken.github.io/box2d.js/demo/webgl/Box2D_v2.2.1_min.js',
//   WASM = 'http://kripken.github.io/box2d.js/demo/webgl/Box2D_v2.2.1_min.wasm.js',
// }

@singleton({ contrib: RenderingPluginContribution })
export class Box2DPlugin implements RenderingPlugin {
  static tag = 'Box2DPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(Box2DPluginOptions)
  private options: Box2DPluginOptions;

  private Box2D: typeof Box2D & EmscriptenModule;
  private world: Box2D.b2World;
  private contactListener: Box2D.JSContactListener;

  /**
   * @see https://github.com/Birch-san/box2d-wasm/blob/c04514c040/docs/memory-model.md
   */
  private temp: Box2D.b2Vec2;
  private temp2: Box2D.b2Vec2;

  private bodies: Record<number, Box2D.b2Body> = {};
  private fixtures: Record<number, Box2D.b2Fixture> = {};
  private pendingDisplayObjects: DisplayObject[] = [];

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(Box2DPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );

      this.Box2D = await this.loadBox2D();

      this.temp = new this.Box2D.b2Vec2(0, 0);
      this.temp2 = new this.Box2D.b2Vec2(0, 0);
      this.createScene();
      this.handlePendingDisplayObjects();

      // do simulation each frame
      this.renderingContext.root.ownerDocument.defaultView.addEventListener(
        CanvasEvent.BEFORE_RENDER,
        simulate,
      );
    });

    renderingService.hooks.destroy.tap(Box2DPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );

      if (this.world) {
        // memory leak
        // @see https://github.com/Birch-san/box2d-wasm/blob/c04514c040/docs/memory-model.md#every-new-needs-a-corresponding-destroy
        this.Box2D.destroy(this.world);
      }
    });

    const simulate = () => {
      if (this.world) {
        const { timeStep, velocityIterations, positionIterations } = this.options;
        // @see https://box2d.org/documentation/classb2_world.html#a82c081319af9a47e282dde807e4cd7b8
        this.world.Step(timeStep, velocityIterations, positionIterations);
        Object.keys(this.bodies).forEach((entity) => {
          const displayObject = this.displayObjectPool.getByEntity(Number(entity));
          const body = this.bodies[entity] as Box2D.b2Body;
          const bpos = body.GetPosition();
          const x = bpos.get_x();
          const y = bpos.get_y();
          // in radians @see https://box2d.org/documentation/classb2_body.html#ab5d135ef592b5f11f4e8d3ffbd831ac5
          const angle = body.GetAngle();

          displayObject.setPosition(x, y);
          displayObject.setEulerAngles(rad2deg(angle));
        });
      }
    };

    const handleMounted = (e: FederatedEvent) => {
      const Box2D = this.Box2D;
      const target = e.target as DisplayObject;
      if (Box2D) {
        this.addActor(target);
      } else {
        this.pendingDisplayObjects.push(target);
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      if (!this.Box2D) {
        return;
      }

      const target = e.target as DisplayObject;
      if (this.world) {
        const body = this.bodies[target.entity];
        const fixture = this.fixtures[target.entity];
        if (body) {
          if (fixture) {
            body.DestroyFixture(fixture);
          }
          this.world.DestroyBody(body);
          delete this.bodies[target.entity];
        }
      }
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      if (!this.Box2D) {
        return;
      }

      const object = e.target as DisplayObject;
      const { attributeName, newValue } = e.detail;
      const { b2_staticBody, b2_dynamicBody } = this.Box2D;

      const body = this.bodies[object.entity];
      const fixture = this.fixtures[object.entity];

      if (body) {
        const geometryAttributes = ['points', 'r', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];
        if (geometryAttributes.indexOf(attributeName) > -1) {
          // need re-create body
        } else if (attributeName === 'rigid') {
          body.SetType(newValue === 'static' ? b2_staticBody : b2_dynamicBody);
        } else if (attributeName === 'linearVelocity') {
          this.temp.set_x(newValue[0]);
          this.temp.set_y(newValue[1]);
          body.SetLinearVelocity(this.temp);
        } else if (attributeName === 'angularVelocity') {
          body.SetAngularVelocity(newValue);
        } else if (attributeName === 'gravityScale') {
          body.SetGravityScale(newValue);
        } else if (attributeName === 'linearDamping') {
          body.SetLinearDamping(newValue);
        } else if (attributeName === 'angularDamping') {
          body.SetAngularDamping(newValue);
        } else if (attributeName === 'fixedRotation') {
          body.SetFixedRotation(newValue);
        } else if (attributeName === 'bullet') {
          body.SetBullet(newValue);
        } else if (attributeName === 'density') {
          // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md76
          fixture.SetDensity(newValue);
          body.ResetMassData();
        } else if (attributeName === 'friction') {
          fixture.SetFriction(newValue);
        } else if (attributeName === 'restitution') {
          fixture.SetRestitution(newValue);
        }
      }
    };
  }

  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    const body = this.bodies[object.entity];
    if (body) {
      this.temp.set_x(force[0]);
      this.temp.set_y(force[1]);
      this.temp2.set_x(point[0]);
      this.temp2.set_y(point[1]);

      // body.ApplyForce(this.temp, body.GetWorldCenter(), false);
      body.ApplyForceToCenter(this.temp, true);
    }
  }

  private createScene() {
    const { b2World, JSContactListener, wrapPointer, b2Contact } = this.Box2D;
    const { gravity, onContact } = this.options;
    this.temp.set_x(gravity[0]);
    this.temp.set_y(gravity[1]);
    this.world = new b2World(this.temp);

    // @see https://github.com/kripken/box2d.js/#using-collision-events
    if (onContact) {
      this.contactListener = new JSContactListener();

      this.contactListener.BeginContact = (contactPtr) => {
        const contact = wrapPointer(contactPtr as number, b2Contact);
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();

        const entityA = Object.keys(this.fixtures).find(
          (entity) => this.fixtures[entity] === fixtureA,
        );
        const entityB = Object.keys(this.fixtures).find(
          (entity) => this.fixtures[entity] === fixtureB,
        );

        if (entityA && entityB) {
          const displayObjectA = this.displayObjectPool.getByEntity(Number(entityA));
          const displayObjectB = this.displayObjectPool.getByEntity(Number(entityB));
          onContact(displayObjectA, displayObjectB);
        }
      };
      // Empty implementations for unused methods.
      this.contactListener.EndContact = () => {};
      this.contactListener.PreSolve = () => {};
      this.contactListener.PostSolve = () => {};

      this.world.SetContactListener(this.contactListener);
    }
  }

  private addActor(target: DisplayObject) {
    const { b2Vec2, b2EdgeShape, b2CircleShape, b2PolygonShape, b2BodyDef, b2_dynamicBody } =
      this.Box2D;
    const { entity, nodeName, parsedStyle } = target;

    let shape: Box2D.b2EdgeShape | Box2D.b2CircleShape | Box2D.b2PolygonShape | Box2D.b2ChainShape;
    if (nodeName === SHAPE.Line) {
      const { x1, y1, x2, y2, defX, defY } = parsedStyle as ParsedLineStyleProps;
      // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_collision.html#autotoc_md39
      shape = new b2EdgeShape();
      const points = sortPointsInCCW([
        [x1, y1],
        [x2, y2],
      ]);
      shape.SetTwoSided(
        new b2Vec2(points[0][0] - defX, points[0][1] - defY),
        new b2Vec2(points[1][0] - defX, points[1][1] - defY),
      );
    } else if (nodeName === SHAPE.Polyline) {
      const { points, defX, defY } = parsedStyle as ParsedBaseStyleProps;
      const pointsInCCW = sortPointsInCCW(points.points);
      const vertices: Box2D.b2Vec2[] = pointsInCCW.map(([x, y]) => new b2Vec2(x - defX, y - defY));
      const prev = pointsInCCW[0];
      const next = pointsInCCW[pointsInCCW.length - 1];
      const eps = 0.1;
      shape = createChainShape(
        this.Box2D,
        vertices,
        false,
        vertices[0],
        vertices[vertices.length - 1],
        // new b2Vec2(prev[0] - defX + eps, prev[1] - defY),
        // new b2Vec2(next[0] - defX + eps, next[1] - defY),
      );
    } else if (nodeName === SHAPE.Rect || nodeName === SHAPE.Image) {
      const { widthInPixels: width, heightInPixels: height } = parsedStyle as ParsedRectStyleProps;
      shape = new b2PolygonShape();
      // @see https://box2d.org/documentation/classb2_polygon_shape.html#af80eb52027ffe85dd4d0a3110eae9d1b
      shape.SetAsBox(width / 2, height / 2, new b2Vec2(width / 2, height / 2), 0);
    } else if (nodeName === SHAPE.Circle) {
      // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_collision.html#autotoc_md37
      const { rInPixels } = parsedStyle as ParsedCircleStyleProps;
      shape = new b2CircleShape();
      shape.set_m_radius(rInPixels);
    } else if (nodeName === SHAPE.Ellipse) {
      // @see https://stackoverflow.com/questions/10032756/how-to-create-ellipse-shapes-in-box2d
    } else if (nodeName === SHAPE.Polygon) {
      const { points, defX, defY } = parsedStyle as ParsedBaseStyleProps;

      const pointsInCCW = sortPointsInCCW(points.points);
      const vertices: Box2D.b2Vec2[] = pointsInCCW.map(([x, y]) => new b2Vec2(x - defX, y - defY));
      shape = createPolygonShape(this.Box2D, vertices);
    } else if (nodeName === SHAPE.Path) {
    } else if (nodeName === SHAPE.Text) {
    }

    if (shape) {
      let body: Box2D.b2Body;
      let bodyDef: Box2D.b2BodyDef;

      const {
        rigid,
        enabled = true,
        linearVelocity = [0, 0],
        angularVelocity = 0,
        density = 1,
        gravityScale = 1,
        linearDamping = 0,
        angularDamping = 0,
        fixedRotation = false,
        bullet = false,
        friction,
        restitution,
      } = target.parsedStyle;

      if (rigid === 'static') {
        bodyDef = new b2BodyDef();
      } else if (rigid === 'dynamic') {
        bodyDef = new b2BodyDef();
        bodyDef.set_type(b2_dynamicBody);
      }

      if (bodyDef) {
        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md60
        bodyDef.set_gravityScale(gravityScale);

        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md59
        bodyDef.set_linearDamping(linearDamping);
        bodyDef.set_angularDamping(angularDamping);

        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md61
        bodyDef.allowSleep = true;

        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md62
        bodyDef.fixedRotation = fixedRotation;

        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md63
        bodyDef.bullet = bullet;

        bodyDef.linearVelocity = new b2Vec2(linearVelocity[0], linearVelocity[1]);
        bodyDef.angularVelocity = angularVelocity;

        const [x, y] = target.getPosition();
        const angle = target.getEulerAngles();
        body = this.world.CreateBody(bodyDef);
        // create fixture
        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md75
        const fixture = body.CreateFixture(shape, rigid === 'static' ? 0 : density);
        fixture.SetDensity(density);
        body.ResetMassData();
        // @see https://box2d.org/documentation/classb2_fixture.html#a097aa48046dd2686db47b7ab8e2cde92
        if (friction) {
          fixture.SetFriction(friction);
        }
        if (restitution) {
          fixture.SetRestitution(restitution);
        }

        // set RTS transform
        // @see https://box2d.org/documentation/classb2_body.html#abfe3e65202189e99f46b8688886eff86
        body.SetTransform(new b2Vec2(x, y), deg2rad(angle));
        // body.SetAwake(true);
        body.SetEnabled(enabled);

        this.bodies[entity] = body;
        this.fixtures[entity] = fixture;
      }
    }
  }

  private handlePendingDisplayObjects() {
    this.pendingDisplayObjects.forEach((object) => {
      this.addActor(object);
    });
    this.pendingDisplayObjects = [];
  }

  private loadBox2D(): Promise<typeof Box2D & EmscriptenModule> {
    const scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.setAttribute('data-box2d-dir', BOX2D_UMD_DIR);
      document.body.appendChild(script);
      script.async = true;
      script.onload = resolve;
      script.src = `${BOX2D_UMD_DIR}entry.js`;
    });

    return new Promise((resolve) => {
      scriptPromise.then(() => {
        (<any>window).Box2D().then((Box2D: any) => {
          resolve(Box2D);
        });
      });
    });
  }
}
