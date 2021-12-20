import { Device, Program, VendorInfo } from '../platform';
import { assert, nullify } from '../platform/utils';
import { preprocessShader_GLSL, ShaderFeature, ShaderFeatureMap } from '../shader/compiler';

export class DeviceProgram {
  name: string = '(unnamed)';

  // Compiled program.
  preprocessedVert: string = '';
  preprocessedFrag: string = '';

  // Inputs.
  both: string = '';
  vert: string = '';
  frag: string = '';
  defines = new Map<string, string>();
  features: ShaderFeatureMap = {
    MRT: true,
  };

  dirty = true;

  definesChanged(): void {
    this.preprocessedVert = '';
    this.preprocessedFrag = '';
  }

  setDefineString(name: string, v: string | null): boolean {
    if (v !== null) {
      if (this.defines.get(name) === v) return false;
      this.defines.set(name, v);
    } else {
      if (!this.defines.has(name)) return false;
      this.defines.delete(name);
    }
    this.definesChanged();
    return true;
  }

  setDefineBool(name: string, v: boolean): boolean {
    return this.setDefineString(name, v ? '1' : null);
  }

  getDefineString(name: string): string | null {
    return nullify(this.defines.get(name));
  }

  getDefineBool(name: string): boolean {
    const str = this.getDefineString(name);
    if (str !== null) assert(str === '1');
    return str !== null;
  }

  ensurePreprocessed(vendorInfo: VendorInfo): void {
    if (this.preprocessedVert === '') {
      this.preprocessedVert = preprocessShader_GLSL(
        vendorInfo,
        'vert',
        this.both + this.vert,
        this.defines,
        this.features,
      );
      this.preprocessedFrag = preprocessShader_GLSL(
        vendorInfo,
        'frag',
        this.both + this.frag,
        this.defines,
        this.features,
      );
    }
  }
}
