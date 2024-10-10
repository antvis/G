import type {
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  ParsedLineStyleProps,
  ParsedPolygonStyleProps,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import {
  AABB,
  CanvasEvent,
  deg2rad,
  ElementEvent,
  rad2deg,
  Shape,
} from '@antv/g-lite';
import { vec2 } from 'gl-matrix';
import { Bodies, Body, Composite, Engine, Render, World } from 'matter-js';
import type { MatterJSBody, MatterJSPluginOptions } from './interfaces';
import { sortPointsInCCW } from './utils';

export class MatterJSPlugin implements RenderingPlugin {
  static tag = 'MatterJS';

  constructor(private options: MatterJSPluginOptions) {}

  private engine: Engine;

  private bodies: Map<DisplayObject, MatterJSBody> = new Map();
  private pendingDisplayObjects: DisplayObject[] = [];

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;
    const simulate = () => {
      if (this.engine) {
        const { timeStep } = this.options;

        if (this.bodies.size) {
          Engine.update(this.engine, 1000 * timeStep);
        }
        this.bodies.forEach(({ body, displayObject }) => {
          const bounds = displayObject.getBounds();
          const { nodeName } = displayObject;
          if (!AABB.isEmpty(bounds)) {
            // position in world space
            const { x } = body.position;
            const { y } = body.position;
            const { angle } = body;

            if (nodeName === Shape.RECT || nodeName === Shape.IMAGE) {
              displayObject.style.x = x - bounds.halfExtents[0];
              displayObject.style.y = y - bounds.halfExtents[1];
            } else if (nodeName === Shape.CIRCLE) {
              displayObject.style.cx = x;
              displayObject.style.cy = y;
            } else if (nodeName === Shape.POLYGON) {
            }

            displayObject.setEulerAngles(rad2deg(angle));
            // displayObject.setPosition(x, y);
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
        const { body } = this.bodies.get(target) || {};
        if (body) {
          World.remove(this.engine.world, body);
          this.bodies.delete(target);
        }
      }
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      if (!this.engine) {
        return;
      }
      const object = e.target as DisplayObject;
      const { attrName, newValue } = e;
      const { body } = this.bodies.get(object) || {};
      if (body) {
        const geometryAttributes = [
          'points',
          'x',
          'y',
          'cx',
          'cy',
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

    renderingService.hooks.init.tap(MatterJSPlugin.tag, () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );

      this.createScene();
      this.handlePendingDisplayObjects();

      // do simulation each frame
      renderingContext.root.ownerDocument.defaultView.addEventListener(
        CanvasEvent.BEFORE_RENDER,
        simulate,
      );
    });

    renderingService.hooks.destroy.tap(MatterJSPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );

      this.bodies.clear();
      this.bodies = null;
    });
  }

  /**
   * @see https://brm.io/matter-js/docs/classes/Body.html#method_applyForce
   */
  applyForce(
    object: DisplayObject,
    force: [number, number],
    point: [number, number],
  ) {
    const { body } = this.bodies.get(object) || {};
    if (body) {
      Body.applyForce(
        body,
        { x: point[0], y: point[1] },
        { x: force[0], y: force[1] },
      );
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
    const { nodeName, parsedStyle } = target;
    const {
      rigid,
      restitution = 0,
      friction = 0.1,
      frictionAir = 0.01,
      frictionStatic = 0.5,
      density = 0.001,
      // anchor,
      velocity = [0, 0],
      angularVelocity = 0,
    } = parsedStyle;
    const bounds = target.getBounds();

    if (!AABB.isEmpty(bounds)) {
      // RTS in worldspace
      const bounds = target.getBounds();
      const aabb = new AABB();
      aabb.update(bounds.center, bounds.halfExtents);
      // TODO:
      // target.getPosition();
      // target.getScale();
      // aabb.setFromTransformedAABB(bounds, this.getWorldTransform(element));
      const { center, halfExtents } = aabb;

      const angle = target.getEulerAngles();
      const config = {
        angle: deg2rad(angle),
        position: {
          x: center[0],
          y: center[1],
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
        const { x1, y1, x2, y2, lineWidth } =
          parsedStyle as ParsedLineStyleProps;
        const p1 = vec2.fromValues(x1, y1);
        const p2 = vec2.fromValues(x2, y2);
        const basis = vec2.sub(vec2.create(), p2, p1);
        const normal = vec2.normalize(
          vec2.create(),
          vec2.fromValues(-basis[1], basis[0]),
        );
        const extrude1 = vec2.scaleAndAdd(
          vec2.create(),
          p1,
          normal,
          lineWidth / 2,
        );
        const extrude2 = vec2.scaleAndAdd(
          vec2.create(),
          p1,
          normal,
          -lineWidth / 2,
        );
        const extrude3 = vec2.scaleAndAdd(
          vec2.create(),
          p2,
          normal,
          lineWidth / 2,
        );
        const extrude4 = vec2.scaleAndAdd(
          vec2.create(),
          p2,
          normal,
          -lineWidth / 2,
        );

        const points = sortPointsInCCW([
          extrude1 as [number, number],
          extrude2 as [number, number],
          extrude3 as [number, number],
          extrude4 as [number, number],
        ]);
        body = Bodies.fromVertices(
          0,
          0,
          [points.map(([x, y]) => ({ x, y }))],
          config,
        );
      } else if (nodeName === Shape.POLYLINE) {
        //   const { points } = parsedStyle as ParsedBaseStyleProps;
        //   const pointsInCCW = sortPointsInCCW(points.points);
        //   const vertices: Box2D.b2Vec2[] = pointsInCCW.map(([x, y]) => new b2Vec2(x , y ));
        //   const prev = pointsInCCW[0];
        //   const next = pointsInCCW[pointsInCCW.length - 1];
        //   const eps = 0.1;
        //   shape = createChainShape(
        //     this.Box2D,
        //     vertices,
        //     false,
        //     vertices[0],
        //     vertices[vertices.length - 1],
        //     // new b2Vec2(prev[0]  + eps, prev[1] ),
        //     // new b2Vec2(next[0]  + eps, next[1] ),
        //   );
      } else if (nodeName === Shape.RECT || nodeName === Shape.IMAGE) {
        // matterjs set origin to center of rectangle
        target.style.transformOrigin = 'center center';
        // target.style.origin = [ / 2,  / 2];
        body = Bodies.rectangle(
          0,
          0,
          halfExtents[0] * 2,
          halfExtents[1] * 2,
          config,
        );
      } else if (nodeName === Shape.CIRCLE) {
        target.style.transformOrigin = 'center center';
        // matter.js also use polygon inside
        body = Bodies.circle(0, 0, halfExtents[0], config);
      } else if (nodeName === Shape.ELLIPSE) {
        // @see https://stackoverflow.com/questions/70491667/matter-js-how-to-draw-an-ellipse
        // @see https://stackoverflow.com/questions/10032756/how-to-create-ellipse-shapes-in-box2d
      } else if (nodeName === Shape.POLYGON) {
        // @see https://brm.io/matter-js/docs/classes/Bodies.html#method_polygon
        const { points } = parsedStyle as ParsedPolygonStyleProps;
        const pts = sortPointsInCCW(points.points.map(([x, y]) => [x, y]));
        target.style.transformOrigin = 'center center';
        body = Bodies.fromVertices(
          0,
          0,
          [pts.map(([x, y]) => ({ x, y }))],
          config,
        );
      } else if (nodeName === Shape.PATH) {
      } else if (nodeName === Shape.TEXT) {
      }
      if (body) {
        this.bodies.set(target, { body, displayObject: target });

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
