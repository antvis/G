export type Entity = number;

export const EMPTY = -1;

let entitySequence = 1;

/**
 * auto increment ID
 */
export function createEntity() {
  return entitySequence++;
}
