import { registerGWebComponent } from ".";
import { GCanvasElement } from "../renderer/canvas";
import './registerShapes';

registerGWebComponent('canvas', GCanvasElement);