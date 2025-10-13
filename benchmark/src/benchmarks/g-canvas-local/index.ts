import { GCanvasLocalEngine } from './engine';
import { testCaseGroups } from './cases';

export const engine = new GCanvasLocalEngine();
testCaseGroups.forEach((group) => engine.addTestSuite(group));
