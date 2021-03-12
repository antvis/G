import { Component } from '@antv/g-ecs';

export class Visible extends Component {
  public static tag = 'c-visible';

  /**
   * can be toggled by `group.show/hide()`
   */
  public visible = true;
}
