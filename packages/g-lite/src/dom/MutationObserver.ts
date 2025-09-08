import type { IElement } from './interfaces';

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord
 */
export interface MutationRecord {
  type: MutationRecordType;
  target: IElement;
  addedNodes?: IElement[];
  attributeName?: string;
  attributeNamespace?: string;
  nextSibling?: IElement;
  oldValue?: string;
  previousSibling?: IElement;
  removedNodes?: IElement[];

  // HACK
  _boundsChangeData?: { affectChildren: boolean };
}
