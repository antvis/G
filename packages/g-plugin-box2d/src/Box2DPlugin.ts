import type {
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  ParsedCircleStyleProps,
  ParsedLineStyleProps,
  ParsedPolygonStyleProps,
  ParsedPolylineStyleProps,
  ParsedRectStyleProps,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import {
  CanvasEvent,
  deg2rad,
  ElementEvent,
  rad2deg,
  Shape,
} from '@antv/g-lite';
import type Box2D from 'box2d-wasm';
import type { Box2DBody, Box2DPluginOptions } from './interfaces';
import { createChainShape, createPolygonShape, sortPointsInCCW } from './utils';

// v2.4
const BOX2D_UMD_DIR = 'https://unpkg.com/box2d-wasm@7.0.0/dist/umd/';

// v2.3
// enum Box2DUrl {
//   JS = 'http://kripken.github.io/box2d.js/demo/webgl/Box2D_v2.2.1_min.js',
//   WASM = 'http://kripken.github.io/box2d.js/demo/webgl/Box2D_v2.2.1_min.wasm.js',
// }

export class Box2DPlugin implements RenderingPlugin {
  static tag = 'Box2D';

  constructor(private options: Partial<Box2DPluginOptions>) {}

  // private Box2D: typeof Box2D & EmscriptenModule;
  private Box2D: any;
  private world: Box2D.b2World;
  private contactListener: Box2D.JSContactListener;

  /**
   * @see https://github.com/Birch-san/box2d-wasm/blob/c04514c040/docs/memory-model.md
   */
  private temp: Box2D.b2Vec2;
  private temp2: Box2D.b2Vec2;

  private bodies: Map<DisplayObject, Box2DBody> = new Map();
  private fixtures: WeakMap<Box2D.b2Fixture, DisplayObject> = new WeakMap();

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const simulate = () => {
      if (this.world) {
        const { timeStep, velocityIterations, positionIterations } =
          this.options;
        // @see https://box2d.org/documentation/classb2_world.html#a82c081319af9a47e282dde807e4cd7b8
        this.world.Step(timeStep, velocityIterations, positionIterations);
        this.bodies.forEach(({ body, displayObject }) => {
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
      const target = e.target as DisplayObject;
      this.addActor(target);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      if (!this.Box2D) {
        return;
      }

      const target = e.target as DisplayObject;
      if (this.world) {
        const { body, fixture } = this.bodies.get(target) || {};
        if (body) {
          if (fixture) {
            body.DestroyFixture(fixture);
          }
          this.world.DestroyBody(body);
          this.bodies.delete(target);
        }
      }
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      if (!this.Box2D) {
        return;
      }

      const object = e.target as DisplayObject;
      const { attrName, newValue } = e;
      const { b2_staticBody, b2_dynamicBody } = this.Box2D;

      const { body, fixture } = this.bodies.get(object) || {};

      if (body) {
        const geometryAttributes = [
          'points',
          'r',
          'width',
          'height',
          'x1',
          'y1',
          'x2',
          'y2',
        ];
        if (geometryAttributes.indexOf(attrName) > -1) {
          // need re-create body
        } else if (attrName === 'rigid') {
          body.SetType(newValue === 'static' ? b2_staticBody : b2_dynamicBody);
        } else if (attrName === 'linearVelocity') {
          this.temp.set_x(newValue[0]);
          this.temp.set_y(newValue[1]);
          body.SetLinearVelocity(this.temp);
        } else if (attrName === 'angularVelocity') {
          body.SetAngularVelocity(newValue);
        } else if (attrName === 'gravityScale') {
          body.SetGravityScale(newValue);
        } else if (attrName === 'linearDamping') {
          body.SetLinearDamping(newValue);
        } else if (attrName === 'angularDamping') {
          body.SetAngularDamping(newValue);
        } else if (attrName === 'fixedRotation') {
          body.SetFixedRotation(newValue);
        } else if (attrName === 'bullet') {
          body.SetBullet(newValue);
        } else if (attrName === 'density') {
          // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md76
          fixture.SetDensity(newValue);
          body.ResetMassData();
        } else if (attrName === 'friction') {
          fixture.SetFriction(newValue);
        } else if (attrName === 'restitution') {
          fixture.SetRestitution(newValue);
        }
      }
    };

    renderingService.hooks.initAsync.tapPromise(Box2DPlugin.tag, async () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );

      this.Box2D = await this.loadBox2D();

      this.temp = new this.Box2D.b2Vec2(0, 0);
      this.temp2 = new this.Box2D.b2Vec2(0, 0);
      this.createScene();

      // do simulation each frame
      canvas.addEventListener(CanvasEvent.BEFORE_RENDER, simulate);
    });

    renderingService.hooks.destroy.tap(Box2DPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );

      if (this.world) {
        // memory leak
        // @see https://github.com/Birch-san/box2d-wasm/blob/c04514c040/docs/memory-model.md#every-new-needs-a-corresponding-destroy
        this.Box2D.destroy(this.world);
      }

      this.bodies.clear();
      this.bodies = null;
      this.fixtures = null;
    });
  }

  applyForce(
    object: DisplayObject,
    force: [number, number],
    point: [number, number],
  ) {
    const { body } = this.bodies.get(object) || {};
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
        const fixtureA = contact.GetFixtureA() as Box2D.b2Fixture;
        const fixtureB = contact.GetFixtureB() as Box2D.b2Fixture;

        const displayObjectA = this.fixtures.get(fixtureA);
        const displayObjectB = this.fixtures.get(fixtureB);

        if (displayObjectA && displayObjectB) {
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
    const {
      b2Vec2,
      b2EdgeShape,
      b2CircleShape,
      b2PolygonShape,
      b2BodyDef,
      b2_dynamicBody,
    } = this.Box2D;
    const { nodeName, parsedStyle } = target;

    let shape:
      | Box2D.b2EdgeShape
      | Box2D.b2CircleShape
      | Box2D.b2PolygonShape
      | Box2D.b2ChainShape;
    if (nodeName === Shape.LINE) {
      const { x1, y1, x2, y2 } = parsedStyle as ParsedLineStyleProps;
      // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_collision.html#autotoc_md39
      shape = new b2EdgeShape();
      const points = sortPointsInCCW([
        [x1, y1],
        [x2, y2],
      ]);
      // @ts-ignore
      shape.SetTwoSided(
        new b2Vec2(points[0][0], points[0][1]),
        new b2Vec2(points[1][0], points[1][1]),
      );
    } else if (nodeName === Shape.POLYLINE) {
      const { points } = parsedStyle as ParsedPolylineStyleProps;
      const pointsInCCW = sortPointsInCCW(points.points);
      const vertices: Box2D.b2Vec2[] = pointsInCCW.map(
        ([x, y]) => new b2Vec2(x, y),
      );
      // const prev = pointsInCCW[0];
      // const next = pointsInCCW[pointsInCCW.length - 1];
      // const eps = 0.1;
      shape = createChainShape(
        this.Box2D,
        vertices,
        false,
        vertices[0],
        vertices[vertices.length - 1],
        // new b2Vec2(prev[0]  + eps, prev[1] ),
        // new b2Vec2(next[0]  + eps, next[1] ),
      );
    } else if (nodeName === Shape.RECT || nodeName === Shape.IMAGE) {
      const { width, height } = parsedStyle as ParsedRectStyleProps;
      shape = new b2PolygonShape();
      // @see https://box2d.org/documentation/classb2_polygon_shape.html#af80eb52027ffe85dd4d0a3110eae9d1b
      // @ts-ignore
      shape.SetAsBox(
        width / 2,
        height / 2,
        new b2Vec2(width / 2, height / 2),
        0,
      );
    } else if (nodeName === Shape.CIRCLE) {
      // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_collision.html#autotoc_md37
      const { r } = parsedStyle as ParsedCircleStyleProps;
      shape = new b2CircleShape();
      shape.set_m_radius(r);
    } else if (nodeName === Shape.ELLIPSE) {
      // @see https://stackoverflow.com/questions/10032756/how-to-create-ellipse-shapes-in-box2d
    } else if (nodeName === Shape.POLYGON) {
      const { points } = parsedStyle as ParsedPolygonStyleProps;

      const pointsInCCW = sortPointsInCCW(points.points);
      const vertices: Box2D.b2Vec2[] = pointsInCCW.map(
        ([x, y]) => new b2Vec2(x, y),
      );
      shape = createPolygonShape(this.Box2D, vertices);
    } else if (nodeName === Shape.PATH) {
    } else if (nodeName === Shape.TEXT) {
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

        bodyDef.linearVelocity = new b2Vec2(
          linearVelocity[0],
          linearVelocity[1],
        );
        bodyDef.angularVelocity = angularVelocity;

        const [x, y] = target.getPosition();
        const angle = target.getEulerAngles();
        body = this.world.CreateBody(bodyDef);
        // create fixture
        // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md75
        const fixture = body.CreateFixture(
          shape,
          rigid === 'static' ? 0 : density,
        );
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

        this.bodies.set(target, {
          displayObject: target,
          fixture,
          body,
        });
        this.fixtures.set(fixture, target);
      }
    }
  }

  private async loadBox2D(): Promise<typeof Box2D & EmscriptenModule> {
    if (<any>window.Box2D) {
      // @ts-ignore
      return await (<any>window.Box2D());
    }
    const hasSIMD = WebAssembly.validate(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10,
        1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
      ]),
    );
    const moduleName = hasSIMD ? './Box2D.simd' : './Box2D';

    // awaiting gives us a better stack trace (at the cost of an extra microtask)
    const modulePromise = await new Promise<any>((resolve, reject) => {
      const tag = document.createElement('script');
      tag.onload = () => {
        resolve(<any>window.Box2D);
        return false;
      };
      tag.onerror = () => {
        reject(
          new Error(
            `Failed to load Box2D. Check your browser console for network errors.`,
          ),
        );
        return false;
      };
      tag.src = `${BOX2D_UMD_DIR}/${moduleName}.js`;
      document.getElementsByTagName('head')[0].appendChild(tag);
    });

    const Box2DFactory = await modulePromise;
    return await Box2DFactory();
  }
}
