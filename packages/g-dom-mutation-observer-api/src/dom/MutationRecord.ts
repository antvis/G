import type { IElement } from '@antv/g-lite';

export class MutationRecord {
  static copy(original: MutationRecord) {
    const record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }

  addedNodes: IElement[] = [];
  attributeName: string = null;
  attributeNamespace: string = null;
  nextSibling: IElement = null;
  oldValue: string = null;
  previousSibling: IElement = null;
  removedNodes: IElement[] = [];
  constructor(
    public type: MutationRecordType,
    public target: IElement,
  ) {}
}
