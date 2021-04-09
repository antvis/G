import { Component } from '@antv/g-ecs';

export class Visible extends Component {
  static tag = 'c-visible';

  /**
   * can be toggled by `group.show/hide()`
   */
  visible = true;
}
