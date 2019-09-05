import * as BaseInterfaces from '@antv/g-base/lib/interfaces';
import * as BaseTypes from '@antv/g-base/lib/types';
import * as CurrentInterfaces from './interfaces';
import * as CurrentTypes from './types';
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
  ...CurrentTypes,
};

export { Interfaces, Types, Canvas, Group, Shape, version };
