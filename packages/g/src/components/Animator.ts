import { Component } from '@antv/g-ecs';
import { Animation } from '../types';

export const enum STATUS {
  Running = 'Running',
  Paused = 'Paused',
  Stopped = 'Stopped',
}

export class Animator extends Component {
  static tag = 'c-animation';

  status: STATUS;

  animations: Animation[] = [];
}
