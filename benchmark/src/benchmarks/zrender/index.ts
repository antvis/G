import { ZRenderEngine } from './engine';
import { testCaseGroups } from './cases';

export const engine = new ZRenderEngine();
testCaseGroups.forEach((group) => engine.addTestSuite(group));
