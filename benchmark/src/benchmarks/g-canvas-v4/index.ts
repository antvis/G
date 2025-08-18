import { GCanvasV4Engine } from './engine';
import { testCaseGroups } from './cases';

export const engine = new GCanvasV4Engine();
testCaseGroups.forEach((group) => engine.addTestSuite(group));
