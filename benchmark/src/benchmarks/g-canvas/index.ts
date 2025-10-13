import { GCanvasEngine } from './engine';
import { testCaseGroups } from './cases';

export const engine = new GCanvasEngine();
testCaseGroups.forEach((group) => engine.addTestSuite(group));
