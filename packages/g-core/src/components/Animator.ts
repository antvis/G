import { Component } from '@antv/g-ecs';
import { Animation } from '../types';

export class Animator extends Component {
  public static tag = 'c-animation';

  public isPaused = false;

  public animations: Animation[] = [];
}
