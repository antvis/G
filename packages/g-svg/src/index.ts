import * as BaseInterfaces from '@antv/g-base/lib/interfaces';
import * as BaseTypes from '@antv/g-base/lib/types';
import { BBox } from '@antv/g-base';
import * as CurrentInterfaces from './interfaces';
import Canvas from './canvas';
import Group from './group';
import Shape from './shape';

const pkg = require('../package.json');

const version = pkg.version;

const Interfaces = {
  ...BaseInterfaces,
  ...CurrentInterfaces,
};

const Types = {
  ...BaseTypes,
};

export { Interfaces, Types, BBox, Canvas, Group, Shape, version };
