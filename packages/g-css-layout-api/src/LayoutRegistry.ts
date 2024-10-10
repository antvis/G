import type { LayoutRegistry } from '@antv/g-lite';
import type { LayoutDefinitionCtor } from './LayoutDefinition';

export class DefaultLayoutRegistry implements LayoutRegistry {
  // 系统保留的布局名称，外部用户不能使用
  // private static reservedLayout = ['relative', 'absolute', 'fixed', 'flex', 'dagre', 'autolayout'];
  private static reservedLayout: string[] = [];

  registry: Map<string, LayoutDefinitionCtor> = new Map();

  get size() {
    return this.registry.size;
  }

  hasLayout(name: string) {
    return this.registry.has(name);
  }

  /**
   *
   * @param name layout name, default to 'absolute'
   * @returns layout object
   */
  getLayout(name = 'absolute') {
    if (!this.hasLayout(name)) {
      throw new Error(`invalid layout property: ${name}`);
    }
    return this.registry.get(name);
  }

  updateLayout(name: string, layout: LayoutDefinitionCtor) {
    this.registry.set(name, layout);
  }

  registerLayout(name: string, layout: LayoutDefinitionCtor) {
    if (name === '') {
      throw new TypeError(`layout name cant't be empty`);
    }

    if (DefaultLayoutRegistry.reservedLayout.includes(name)) {
      throw new Error(
        `layout name '${name}' is a system reserved layout name, please use another name`,
      );
    }

    if (this.hasLayout(name)) {
      throw new Error(`layout '${name}' already exist.`);
    }

    this.registry.set(name, layout);
  }

  deleteLayout(name: string) {
    this.registry.delete(name);
  }
}
