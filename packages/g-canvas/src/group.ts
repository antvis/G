import { AbstractGroup } from '@antv/g-base';
import ShapeBase from './shape/base';

class Group extends AbstractGroup {

  getShapeBase() {
    return ShapeBase;
  }

  getGroupBase() {
    return Group;
  }

}

export default Group;
