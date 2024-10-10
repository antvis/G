import { quat } from 'gl-matrix';
import type {
  DisplayObject,
  FederatedEvent,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { AABB, CanvasEvent, ElementEvent } from '@antv/g-lite';
import { PhysxBody } from './interfaces';

/**
 * PhysX runtime mode.
 */
export enum PhysXRuntimeMode {
  /** Use webAssembly mode first, if WebAssembly mode is not supported, roll back to JavaScript mode.  */
  Auto,
  /** WebAssembly mode. */
  WebAssembly,
  /** JavaScript mode. */
  JavaScript,
}

/**
 * Flags which affect the behavior of Shapes.
 */
export enum ShapeFlag {
  /** The shape will partake in collision in the physical simulation. */
  SIMULATION_SHAPE = 1 << 0,
  /** The shape will partake in scene queries (ray casts, overlap tests, sweeps, ...). */
  SCENE_QUERY_SHAPE = 1 << 1,
  /** The shape is a trigger which can send reports whenever other shapes enter/leave its volume. */
  TRIGGER_SHAPE = 1 << 2,
}

/**
 * Describes how physics materials of the colliding objects are combined.
 */
enum CombineMode {
  /** Averages the friction/bounce of the two colliding materials. */
  Average,
  /** Uses the smaller friction/bounce of the two colliding materials. */
  Minimum,
  /** Multiplies the friction/bounce of the two colliding materials. */
  Multiply,
  /** Uses the larger friction/bounce of the two colliding materials. */
  Maximum,
}

export class PhysXPlugin implements RenderingPlugin {
  static tag = 'PhysX';

  private PhysX: any;
  private physics: any;
  private scene: any;
  private bodies: Map<DisplayObject, PhysxBody> = new Map();

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const handleMounted = (e: FederatedEvent) => {
      const { PhysX } = this;
      const target = e.target as DisplayObject;

      if (PhysX) {
        this.addActor(target);
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const { PhysX } = this;
      const target = e.target as DisplayObject;

      if (PhysX) {
        this.bodies.get(target).body.release();
      }
    };

    renderingService.hooks.initAsync.tapPromise(PhysXPlugin.tag, async () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);

      this.PhysX = (await this.initPhysX()) as any;
      this.createScene();

      // do simulation each frame
      renderingContext.root.ownerDocument.defaultView.addEventListener(
        CanvasEvent.BEFORE_RENDER,
        () => {
          if (this.scene) {
            this.scene.simulate(1 / 60, true);
            this.scene.fetchResults(true);

            this.bodies.forEach(({ body, displayObject }) => {
              const transform = body.getGlobalPose();
              const { translation, rotation } = transform;

              // console.log(translation, rotation, displayObject);

              displayObject.setPosition(
                translation.x,
                translation.y,
                translation.z,
              );
              displayObject.setRotation(
                rotation.x,
                rotation.y,
                rotation.z,
                rotation.w,
              );
            });
          }
        },
      );
    });

    renderingService.hooks.destroy.tap(PhysXPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
    });
  }

  // @see https://github.com/oasis-engine/engine/blob/main/packages/physics-physx/src/PhysXPhysics.ts#L39
  private async initPhysX(
    runtimeMode: PhysXRuntimeMode = PhysXRuntimeMode.Auto,
  ): Promise<void> {
    if ((<any>window).PHYSX) {
      return await (<any>window).PHYSX();
    }
    const scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.async = true;
      script.onload = resolve;

      const supported = (() => {
        try {
          if (
            typeof WebAssembly === 'object' &&
            typeof WebAssembly.instantiate === 'function'
          ) {
            const module = new WebAssembly.Module(
              Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
            );
            if (module instanceof WebAssembly.Module)
              return (
                new WebAssembly.Instance(module) instanceof WebAssembly.Instance
              );
          }
        } catch {}
        return false;
      })();
      if (runtimeMode === PhysXRuntimeMode.Auto) {
        if (supported) {
          runtimeMode = PhysXRuntimeMode.WebAssembly;
        } else {
          runtimeMode = PhysXRuntimeMode.JavaScript;
        }
      }

      if (runtimeMode === PhysXRuntimeMode.JavaScript) {
        script.src =
          'https://gw.alipayobjects.com/os/lib/oasis-engine/physics-physx/1.0.0-alpha.4/libs/physx.release.js.js';
      } else if (runtimeMode === PhysXRuntimeMode.WebAssembly) {
        script.src =
          'https://gw.alipayobjects.com/os/lib/oasis-engine/physics-physx/1.0.0-alpha.4/libs/physx.release.js';
      }
    });

    return new Promise((resolve) => {
      scriptPromise.then(() => {
        (<any>window).PHYSX().then((PHYSX: any) => {
          resolve(PHYSX);
        });
      });
    });
  }

  private createScene() {
    const { PhysX } = this;
    const version = PhysX.PX_PHYSICS_VERSION;
    const defaultErrorCallback = new PhysX.PxDefaultErrorCallback();
    const allocator = new PhysX.PxDefaultAllocator();
    const foundation = PhysX.PxCreateFoundation(
      version,
      allocator,
      defaultErrorCallback,
    );
    const triggerCallback = {
      onContactBegin: () => {
        console.log('begin...');
      },
      onContactEnd: (index1, index2) => {
        console.log('end...', index1, index2);
      },
      onContactPersist: () => {},
      onTriggerBegin: () => {
        console.log('triggerbegin...');
      },
      onTriggerEnd: () => {
        console.log('triggerend...');
      },
    };
    const physxSimulationCallbackInstance =
      PhysX.PxSimulationEventCallback.implement(triggerCallback);

    this.physics = PhysX.PxCreatePhysics(
      version,
      foundation,
      new PhysX.PxTolerancesScale(),
      false,
      null,
    );
    PhysX.PxInitExtensions(this.physics, null);
    const sceneDesc = PhysX.getDefaultSceneDesc(
      this.physics.getTolerancesScale(),
      0,
      physxSimulationCallbackInstance,
    );
    this.scene = this.physics.createScene(sceneDesc);
    this.scene.setGravity({
      x: 0,
      y: 100,
      z: 0,
    });
  }

  private addActor(target: DisplayObject) {
    const bounds = target.getBounds();
    if (!AABB.isEmpty(bounds) && target.parsedStyle.rigid) {
      const { halfExtents } = bounds;

      const { PhysX } = this;
      const pos = target.getPosition();
      const rotation = quat.normalize(quat.create(), target.getRotation());

      // use box by default
      const geometry = new PhysX.PxBoxGeometry(
        // PhysX uses half-extents
        halfExtents[0],
        halfExtents[1],
        halfExtents[2] || 0.1, // account for 2D shapes
      );
      const material = this.physics.createMaterial(0.5, 0.1, 2);
      material.setFrictionCombineMode(CombineMode.Average);
      material.setRestitutionCombineMode(CombineMode.Average);

      // @see https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxapi/files/structPxShapeFlag.html#a6edb481aaa3a998c5d6dd3fc4ad87f1aa7fa4fea0eecda9cc80a7aaa11a22df52
      const flags = new PhysX.PxShapeFlags(
        ShapeFlag.SCENE_QUERY_SHAPE | ShapeFlag.SIMULATION_SHAPE,
        // ShapeFlag.TRIGGER_SHAPE,
      );
      // @see https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxapi/files/classPxPhysics.html#abc564607f208cbc1944880172a3d62fe
      const shape = this.physics.createShape(geometry, material, true, flags);
      shape.setUUID(target.entity);

      const transform = {
        translation: {
          x: pos[0],
          y: pos[1], // flipY
          z: pos[2],
        },
        rotation: {
          w: rotation[3], // PhysX uses WXYZ quaternions,
          x: rotation[0],
          y: rotation[1],
          z: rotation[2],
        },
      };

      // dynamic or static
      let body;
      if (target.parsedStyle.rigid === 'static') {
        // @see https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxapi/files/classPxPhysics.html#a82949b1375677a8c58d64c7cd47b7f4b
        body = this.physics.createRigidStatic(transform);
      } else if (target.parsedStyle.rigid === 'dynamic') {
        body = this.physics.createRigidDynamic(transform);
      }

      // @see https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxapi/files/classPxRigidActor.html#a022e098ea67bc8ec87f93c2f18a4db6f
      body.attachShape(shape);

      // if (body.setRigidBodyFlag) {
      //   body.setRigidBodyFlag(PhysX.PxRigidBodyFlag.eENABLE_CCD, true);
      // }

      body.setGlobalPose(transform, true);

      this.bodies.set(target, {
        displayObject: target,
        body,
      });

      // @see https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxapi/files/classPxScene.html#a033c70c3094db21a2c51246e1a65a0e5
      this.scene.addActor(body, null);
    }
  }
}
