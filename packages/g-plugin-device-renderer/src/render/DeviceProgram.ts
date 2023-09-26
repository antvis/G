import { isNil } from '@antv/util';
import { assert, nullify } from '@antv/g-device-api';

export class DeviceProgram {
  name = '(unnamed)';

  // Compiled program.
  preprocessedVert = '';
  preprocessedFrag = '';

  // Inputs.
  both = '';
  vert = '';
  frag = '';
  defines: Record<string, string> = {};

  definesChanged(): void {
    this.preprocessedVert = '';
    this.preprocessedFrag = '';
  }

  setDefineString(name: string, v: string | null): boolean {
    if (v !== null) {
      if (this.defines[name] === v) return false;
      this.defines[name] = v;
    } else {
      if (isNil(this.defines[name])) return false;
      delete this.defines[name];
    }
    this.definesChanged();
    return true;
  }

  setDefineBool(name: string, v: boolean): boolean {
    return this.setDefineString(name, v ? '1' : null);
  }

  getDefineString(name: string): string | null {
    return nullify(this.defines[name]);
  }

  getDefineBool(name: string): boolean {
    const str = this.getDefineString(name);
    if (str !== null) assert(str === '1');
    return str !== null;
  }
}
