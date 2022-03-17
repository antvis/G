import { registerGWebComponent } from ".";
import { GWebGLElement } from "../renderer/webgl";
import './registerShapes';


registerGWebComponent('webgl', GWebGLElement);