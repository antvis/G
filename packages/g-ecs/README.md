# g-ecs: a simple ECS implement for G

## Architecture

A typical ECS architecture(borrow from ecsy):

![](https://blog.mozvr.com/content/images/2019/10/ECSY-Architecture.svg)

## Usage

```typescript
import { Container } from 'inversify';
import { Component, System, containerModule } from '@antv/g-ecs';

// create a container
const container = new Container();
// load ECS module
container.load(containerModule);

// create a world
const world = container.get(World);

// register components
class C1 extends Component {
  static tag = 'c1';
  p1: number;
}
class C2 extends Component {
  static tag = 'c2';
}
class C3 extends Component {
  static tag = 'c3';
}
world.registerComponent(C1).registerComponent(C2).registerComponent(C3);

// register systems
class S1 extends System {
  static tag = 's1';

  trigger() {
    return new Matcher().allOf(C1);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const c1 = entity.getComponent(C1);
      c1.p1++;
    });
  }
}
world.registerSystem(S1);

// create an entity
const entity = world.createEntity();
entity.addComponent(C1, { p1: 2 }).addComponent(C2).addComponent(C3);

// make a loop
let lastTime = performance.now();
const run = () => {
  const time = performance.now();
  const delta = time - lastTime;
  // run all the systems
  world.execute(delta, time);

  lastTime = time;
  requestAnimationFrame(run);
};
run();
```

## See also

- [ecsy](https://blog.mozvr.com/introducing-ecsy/)
- [Entitas](https://github.com/sschmid/Entitas-CSharp)
- [EntitasCookBook](https://github.com/mzaks/EntitasCookBook)
