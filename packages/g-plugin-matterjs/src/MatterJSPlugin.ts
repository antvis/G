import { inject, singleton } from 'mana-syringe';
import { vec2 } from 'gl-matrix';
import {
  DisplayObjectPool,
  RenderingPluginContribution,
  SceneGraphService,
  RenderingContext,
  ElementEvent,
  CanvasEvent,
  Shape,
  rad2deg,
  deg2rad,
  AABB,
} from '@antv/g';
import type {
  FederatedEvent,
  RenderingService,
  RenderingPlugin,
  MutationEvent,
  DisplayObject,
  ParsedLineStyleProps,
  ParsedCircleStyleProps,
  ParsedRectStyleProps,
  ParsedBaseStyleProps,
} from '@antv/g';
import { Engine, Render, Bodies, Body, Composite, World } from 'matter-js';
import { MatterJSPluginOptions } from './tokens';
import { sortPointsInCCW } from './utils';

@singleton({ contrib: RenderingPluginContribution })
export class MatterJSPlugin implements RenderingPlugin {
  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(MatterJSPluginOptions)
  private options: MatterJSPluginOptions;

  private engine: Engine;

  private bodies: Record<number, Body> = {};
  private pendingDisplayObjects: DisplayObject[] = [];

  apply(renderingService: RenderingService) {
    const simulate = () => {
      if (this.engine) {
        const { timeStep } = this.options;

        if (Object.keys(this.bodies).length) {
          Engine.update(this.engine, 1000 * timeStep);
        }

        Object.keys(this.bodies).forEach((entity) => {
          const displayObject = this.displayObjectPool.getByEntity(Number(entity));
          const bounds = displayObject.getBounds();

          if (!AABB.isEmpty(bounds)) {
            const { anchor } = displayObject.parsedStyle as ParsedBaseStyleProps;
            const { halfExtents } = bounds;
            const body = this.bodies[entity] as Body;
            const x = body.position.x - (1 - anchor[0].value * 2) * halfExtents[0];
            const y = body.position.y - (1 - anchor[1].value * 2) * halfExtents[1];
            const angle = body.angle;

            displayObject.setPosition(x, y);
            displayObject.setEulerAngles(rad2deg(angle));
          }
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

    const handleAttributeChanged = (e: MutationEvent) => {
      if (!this.engine) {
        return;
      }
      const object = e.target as DisplayObject;
      const { attrName, newValue } = e;
      const body = this.bodies[object.entity];

      if (body) {
        const geometryAttributes = ['points', 'r', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];
        if (geometryAttributes.indexOf(attrName) > -1) {
          // need re-create body
        } else if (attrName === 'rigid') {
          Body.setStatic(body, newValue === 'static');
        } else if (attrName === 'velocity') {
          Body.setVelocity(body, { x: newValue[0], y: newValue[1] });
        } else if (attrName === 'angularVelocity') {
          Body.setAngularVelocity(body, newValue);
        } else if (attrName === 'density') {
          Body.setDensity(body, newValue);
        } else if (attrName === 'friction') {
          body.friction = newValue;
        } else if (attrName === 'frictionAir') {
          body.frictionAir = newValue;
        } else if (attrName === 'frictionStatic') {
          body.frictionStatic = newValue;
        } else if (attrName === 'restitution') {
          body.restitution = newValue;
        }
      }
    };

    renderingService.hooks.init.tapPromise(async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
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

    renderingService.hooks.destroy.tap(() => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });
  }

  /**
   * @see https://brm.io/matter-js/docs/classes/Body.html#method_applyForce
   */
  applyForce(object: DisplayObject, force: [number, number], point: [number, number]) {
    const body = this.bodies[object.entity];
    if (body) {
      Body.applyForce(body, { x: point[0], y: point[1] }, { x: force[0], y: force[1] });
    }
  }

  private createScene() {
    this.engine = Engine.create();

    const {
      debug,
      debugContainer,
      debugCanvasHeight,
      debugCanvasWidth,
      velocityIterations,
      positionIterations,
      gravity,
      gravityScale,
    } = this.options;

    if (debug && debugContainer) {
      const render = Render.create({
        element: debugContainer,
        engine: this.engine,
        options: {
          width: debugCanvasWidth,
          height: debugCanvasHeight,
          wireframes: true,
        },
      });
      Render.run(render);
    }

    // @see https://brm.io/matter-js/docs/classes/Engine.html#property_gravity
    this.engine.gravity = {
      x: gravity[0],
      y: gravity[1],
      scale: gravityScale,
    };

    // @see https://brm.io/matter-js/docs/classes/Engine.html#property_positionIterations
    this.engine.positionIterations = positionIterations;
    // @see https://brm.io/matter-js/docs/classes/Engine.html#property_velocityIterations
    this.engine.velocityIterations = velocityIterations;
  }

  private addActor(target: DisplayObject) {
    const { entity, nodeName, parsedStyle } = target;
    const {
      rigid,
      restitution = 0,
      friction = 0.1,
      frictionAir = 0.01,
      frictionStatic = 0.5,
      density = 0.001,
      anchor,
      velocity = [0, 0],
      angularVelocity = 0,
    } = parsedStyle;
    const bounds = target.getBounds();

    if (!AABB.isEmpty(bounds)) {
      const { halfExtents } = bounds;
      // RTS in worldspace
      const [x, y] = target.getPosition();
      const angle = target.getEulerAngles();
      const config = {
        angle: deg2rad(angle),
        position: {
          x: x + (1 - anchor[0].value * 2) * halfExtents[0],
          y: y + (1 - anchor[1].value * 2) * halfExtents[1],
        },
        isStatic: rigid === 'static',
        // @see https://brm.io/matter-js/docs/classes/Body.html#property_restitution
        restitution,
        // @see https://brm.io/matter-js/docs/classes/Body.html#property_friction
        friction,
        frictionAir,
        frictionStatic,
        // @see https://brm.io/matter-js/docs/classes/Body.html#property_density
        density,
        velocity,
        angularVelocity,
      };

      let body: Body;
      if (nodeName === Shape.LINE) {
        const { x1, y1, x2, y2, defX, defY, lineWidth } = parsedStyle as ParsedLineStyleProps;
        const p1 = vec2.fromValues(x1.value - defX, y1.value - defY);
        const p2 = vec2.fromValues(x2.value - defX, y2.value - defY);
        const basis = vec2.sub(vec2.create(), p2, p1);
        const normal = vec2.normalize(vec2.create(), vec2.fromValues(-basis[1], basis[0]));
        const extrude1 = vec2.scaleAndAdd(vec2.create(), p1, normal, lineWidth.value / 2);
        const extrude2 = vec2.scaleAndAdd(vec2.create(), p1, normal, -lineWidth.value / 2);
        const extrude3 = vec2.scaleAndAdd(vec2.create(), p2, normal, lineWidth.value / 2);
        const extrude4 = vec2.scaleAndAdd(vec2.create(), p2, normal, -lineWidth.value / 2);

        // @ts-ignore
        const points = sortPointsInCCW([extrude1, extrude2, extrude3, extrude4]);
        body = Bodies.fromVertices(0, 0, [points.map(([x, y]) => ({ x, y }))], config);
      } else if (nodeName === Shape.POLYLINE) {
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
      } else if (nodeName === Shape.RECT || nodeName === Shape.IMAGE) {
        const { width, height } = parsedStyle as ParsedRectStyleProps;
        // matterjs set origin to center of rectangle
        target.style.transformOrigin = 'center center';
        // target.style.origin = [ / 2,  / 2];
        body = Bodies.rectangle(0, 0, width.value, height.value, config);
      } else if (nodeName === Shape.CIRCLE) {
        const { r } = parsedStyle as ParsedCircleStyleProps;
        // matter.js also use polygon inside
        body = Bodies.circle(0, 0, r.value, config);
      } else if (nodeName === Shape.ELLIPSE) {
        // @see https://stackoverflow.com/questions/10032756/how-to-create-ellipse-shapes-in-box2d
      } else if (nodeName === Shape.POLYGON) {
        // @see https://brm.io/matter-js/docs/classes/Bodies.html#method_polygon
        const { points, defX, defY } = parsedStyle as ParsedBaseStyleProps;
        const pts = sortPointsInCCW(points.points.map(([x, y]) => [x - defX, y - defY]));
        target.style.transformOrigin = 'center center';
        body = Bodies.fromVertices(0, 0, [pts.map(([x, y]) => ({ x, y }))], config);
      } else if (nodeName === Shape.PATH) {
      } else if (nodeName === Shape.TEXT) {
      }
      if (body) {
        this.bodies[entity] = body;

        Composite.add(this.engine.world, body);
      }
    }
  }

  private handlePendingDisplayObjects() {
    this.pendingDisplayObjects.forEach((object) => {
      this.addActor(object);
    });
    this.pendingDisplayObjects = [];
  }
}
