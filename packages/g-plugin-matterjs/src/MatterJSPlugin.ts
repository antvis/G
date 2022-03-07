import { inject, singleton } from 'mana-syringe';
import { vec2 } from 'gl-matrix';
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
import { Engine, Runner, Bodies, Body, Composite, World } from 'matter-js';
import { MatterJSPluginOptions } from './tokens';
import { sortPointsInCCW } from './utils';

@singleton({ contrib: RenderingPluginContribution })
export class MatterJSPlugin implements RenderingPlugin {
  static tag = 'MatterJSPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(MatterJSPluginOptions)
  private options: MatterJSPluginOptions;

  private engine: Engine;
  private runner: Runner;

  private bodies: Record<number, Body> = {};
  private pendingDisplayObjects: DisplayObject[] = [];

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tap(MatterJSPlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );

      this.createScene();
      this.handlePendingDisplayObjects();

      // do simulation each frame
      this.renderingContext.root.ownerDocument.defaultView.addEventListener(
        CanvasEvent.BEFORE_RENDER,
        simulate,
      );
    });

    renderingService.hooks.destroy.tap(MatterJSPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
    });

    const simulate = () => {
      if (this.engine) {
        const { timeStep } = this.options;

        if (Object.keys(this.bodies).length) {
          Engine.update(this.engine, 1000 * timeStep);
        }

        Object.keys(this.bodies).forEach((entity) => {
          const displayObject = this.displayObjectPool.getByEntity(Number(entity));
          const body = this.bodies[entity] as Body;
          const x = body.position.x;
          const y = body.position.y;
          const angle = body.angle;

          console.log(body, x, y, angle);

          displayObject.setPosition(x, y);
          displayObject.setEulerAngles(rad2deg(angle));
        });
      }
    };

    const handleMounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      if (this.engine) {
        this.addActor(target);
      } else {
        this.pendingDisplayObjects.push(target);
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      if (this.engine) {
        const body = this.bodies[target.entity];
        if (body) {
          World.remove(this.engine.world, body);
          delete this.bodies[target.entity];
        }
      }
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      // if (!this.Box2D) {
      //   return;
      // }
      // const object = e.target as DisplayObject;
      // const { attributeName, newValue } = e.detail;
      // const { b2_staticBody, b2_dynamicBody } = this.Box2D;
      // const body = this.bodies[object.entity];
      // const fixture = this.fixtures[object.entity];
      // if (body) {
      //   const geometryAttributes = ['points', 'r', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];
      //   if (geometryAttributes.indexOf(attributeName) > -1) {
      //     // need re-create body
      //   } else if (attributeName === 'rigid') {
      //     body.SetType(newValue === 'static' ? b2_staticBody : b2_dynamicBody);
      //   } else if (attributeName === 'linearVelocity') {
      //     this.temp.set_x(newValue[0]);
      //     this.temp.set_y(newValue[1]);
      //     body.SetLinearVelocity(this.temp);
      //   } else if (attributeName === 'angularVelocity') {
      //     body.SetAngularVelocity(newValue);
      //   } else if (attributeName === 'gravityScale') {
      //     body.SetGravityScale(newValue);
      //   } else if (attributeName === 'linearDamping') {
      //     body.SetLinearDamping(newValue);
      //   } else if (attributeName === 'angularDamping') {
      //     body.SetAngularDamping(newValue);
      //   } else if (attributeName === 'fixedRotation') {
      //     body.SetFixedRotation(newValue);
      //   } else if (attributeName === 'bullet') {
      //     body.SetBullet(newValue);
      //   } else if (attributeName === 'density') {
      //     // @see https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md76
      //     fixture.SetDensity(newValue);
      //     body.ResetMassData();
      //   } else if (attributeName === 'friction') {
      //     fixture.SetFriction(newValue);
      //   } else if (attributeName === 'restitution') {
      //     fixture.SetRestitution(newValue);
      //   }
      // }
    };
  }

  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    const body = this.bodies[object.entity];
    // if (body) {
    //   this.temp.set_x(force[0]);
    //   this.temp.set_y(force[1]);
    //   this.temp2.set_x(point[0]);
    //   this.temp2.set_y(point[1]);

    //   // body.ApplyForce(this.temp, body.GetWorldCenter(), false);
    //   body.ApplyForceToCenter(this.temp, true);
    // }
  }

  private createScene() {
    this.engine = Engine.create();
    // this.runner = Runner.create();

    const { velocityIterations, positionIterations, gravity, gravityScale } = this.options;

    // @see https://brm.io/matter-js/docs/classes/Engine.html#property_gravity
    // this.engine.gravity = {
    //   x: gravity[0],
    //   y: gravity[1],
    //   scale: gravityScale,
    // };

    // // @see https://brm.io/matter-js/docs/classes/Engine.html#property_positionIterations
    // this.engine.positionIterations = positionIterations;

    // // @see https://brm.io/matter-js/docs/classes/Engine.html#property_velocityIterations
    // this.engine.velocityIterations = velocityIterations;

    // start simulation
    // Runner.run(this.runner, this.engine);
  }

  private addActor(target: DisplayObject) {
    const { entity, nodeName, parsedStyle } = target;
    const { rigid, restitution = 0, friction = 0.1, density = 1 } = parsedStyle;

    // RTS in worldspace
    const [x, y] = target.getPosition();
    const angle = target.getEulerAngles();
    const config = {
      angle: deg2rad(angle),
      position: { x, y },
      isStatic: rigid === 'static',
      // @see https://brm.io/matter-js/docs/classes/Body.html#property_angularDamping
      restitution,
      // @see https://brm.io/matter-js/docs/classes/Body.html#property_friction
      friction,
      // @see https://brm.io/matter-js/docs/classes/Body.html#property_density
      density: density / 1000,
    };

    let body: Body;
    if (nodeName === SHAPE.Line) {
      const { x1, y1, x2, y2, defX, defY, lineWidth } = parsedStyle as ParsedLineStyleProps;
      const p1 = vec2.fromValues(x1 - defX, y1 - defY);
      const p2 = vec2.fromValues(x2 - defX, y2 - defY);
      const basis = vec2.sub(vec2.create(), p2, p1);
      const normal = vec2.normalize(vec2.create(), vec2.fromValues(-basis[1], basis[0]));
      const extrude1 = vec2.scaleAndAdd(vec2.create(), p1, normal, lineWidth / 2);
      const extrude2 = vec2.scaleAndAdd(vec2.create(), p1, normal, -lineWidth / 2);
      const extrude3 = vec2.scaleAndAdd(vec2.create(), p2, normal, lineWidth / 2);
      const extrude4 = vec2.scaleAndAdd(vec2.create(), p2, normal, -lineWidth / 2);

      // @ts-ignore
      const points = sortPointsInCCW([extrude1, extrude2, extrude3, extrude4]);
      body = Bodies.fromVertices(0, 0, [points.map(([x, y]) => ({ x, y }))], config);
    } else if (nodeName === SHAPE.Polyline) {
      //   const { points, defX, defY } = parsedStyle as ParsedBaseStyleProps;
      //   const pointsInCCW = sortPointsInCCW(points.points);
      //   const vertices: Box2D.b2Vec2[] = pointsInCCW.map(([x, y]) => new b2Vec2(x - defX, y - defY));
      //   const prev = pointsInCCW[0];
      //   const next = pointsInCCW[pointsInCCW.length - 1];
      //   const eps = 0.1;
      //   shape = createChainShape(
      //     this.Box2D,
      //     vertices,
      //     false,
      //     vertices[0],
      //     vertices[vertices.length - 1],
      //     // new b2Vec2(prev[0] - defX + eps, prev[1] - defY),
      //     // new b2Vec2(next[0] - defX + eps, next[1] - defY),
      //   );
    } else if (nodeName === SHAPE.Rect || nodeName === SHAPE.Image) {
      const { widthInPixels, heightInPixels } = parsedStyle as ParsedRectStyleProps;
      body = Bodies.rectangle(0, 0, widthInPixels, heightInPixels, config);
    } else if (nodeName === SHAPE.Circle) {
      const { rInPixels: r } = parsedStyle as ParsedCircleStyleProps;
      body = Bodies.circle(0, 0, r, config);
    } else if (nodeName === SHAPE.Ellipse) {
      //   // @see https://stackoverflow.com/questions/10032756/how-to-create-ellipse-shapes-in-box2d
    } else if (nodeName === SHAPE.Polygon) {
      // @see https://brm.io/matter-js/docs/classes/Bodies.html#method_polygon
      //   const { points, defX, defY } = parsedStyle as ParsedBaseStyleProps;
      //   const pointsInCCW = sortPointsInCCW(points.points);
      //   const vertices: Box2D.b2Vec2[] = pointsInCCW.map(([x, y]) => new b2Vec2(x - defX, y - defY));
      //   shape = createPolygonShape(this.Box2D, vertices);
    } else if (nodeName === SHAPE.Path) {
    } else if (nodeName === SHAPE.Text) {
    }
    if (body) {
      this.bodies[entity] = body;

      World.addBody(this.engine.world, body);
    }
  }

  private handlePendingDisplayObjects() {
    this.pendingDisplayObjects.forEach((object) => {
      this.addActor(object);
    });
    this.pendingDisplayObjects = [];
  }
}
