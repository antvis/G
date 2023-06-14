/* tslint:disable */
/* eslint-disable */
/**
 * @param {string} source
 * @param {string} stage
 * @param {boolean} validation_enabled
 * @returns {string}
 */
export function glsl_compile(
  source: string,
  stage: string,
  validation_enabled: boolean,
): string;

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly glsl_compile: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function init(
  module_or_path?: InitInput | Promise<InitInput>,
): Promise<InitOutput>;
