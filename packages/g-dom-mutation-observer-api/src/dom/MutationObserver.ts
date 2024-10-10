/* eslint-disable max-classes-per-file */
import type { DisplayObject, IElement } from '@antv/g-lite';
import { ElementEvent, MutationEvent, runtime } from '@antv/g-lite';
import { MutationRecord } from './MutationRecord';

let uidCounter = 0;
const registrationsTable = new WeakMap<IElement, Registration[]>();

export class Registration {
  private transientObservedNodes = [];

  constructor(
    public observer: MutationObserver,
    public target: IElement,
    public options?: MutationObserverInit,
  ) {}

  enqueue(record: MutationRecord) {
    const { records } = this.observer;
    const { length } = records;

    // There are cases where we replace the last record with the new record.
    // For example if the record represents the same mutation we need to use
    // the one with the oldValue. If we get same record (this can happen as we
    // walk up the tree) we ignore the new record.
    if (records.length > 0) {
      const lastRecord = records[length - 1];
      const recordToReplaceLast = selectRecord(lastRecord, record);
      if (recordToReplaceLast) {
        records[length - 1] = recordToReplaceLast;
        return;
      }
    } else {
      scheduleCallback(this.observer);
    }

    records[length] = record;
  }

  addListeners() {
    this.addListeners_(this.target);
  }

  private addListeners_(node: IElement) {
    const { options } = this;
    if (options.attributes)
      node.addEventListener(ElementEvent.ATTR_MODIFIED, this, true);

    // if (options.characterData) node.addEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.addEventListener(ElementEvent.INSERTED, this, true);

    if (options.childList || options.subtree)
      node.addEventListener(ElementEvent.REMOVED, this, true);
  }

  removeListeners() {
    this.removeListeners_(this.target);
  }

  removeListeners_(node: IElement) {
    const { options } = this;
    if (options.attributes)
      node.removeEventListener(ElementEvent.ATTR_MODIFIED, this, true);

    // if (options.characterData) node.removeEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.removeEventListener(ElementEvent.INSERTED, this, true);

    if (options.childList || options.subtree)
      node.removeEventListener(ElementEvent.REMOVED, this, true);
  }

  /**
   * Adds a transient observer on node. The transient observer gets removed
   * next time we deliver the change records.
   */
  // addTransientObserver(node: IElement) {
  //   // Don't add transient observers on the target itself. We already have all
  //   // the required listeners set up on the target.
  //   if (node === this.target) return;

  //   this.addListeners_(node);
  //   this.transientObservedNodes.push(node);
  //   let registrations = registrationsTable.get(node);
  //   if (!registrations) registrationsTable.set(node, (registrations = []));

  //   // We know that registrations does not contain this because we already
  //   // checked if node === this.target.
  //   registrations.push(this);
  // }

  removeTransientObservers() {
    const { transientObservedNodes } = this;
    this.transientObservedNodes = [];

    transientObservedNodes.forEach(function (node) {
      // Transient observers are never added to the target.
      this.removeListeners_(node);

      const registrations = registrationsTable.get(node);
      for (let i = 0; i < registrations.length; i++) {
        if (registrations[i] === this) {
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
  }

  handleEvent(e: MutationEvent) {
    // Stop propagation since we are managing the propagation manually.
    // This means that other mutation events on the page will not work
    // correctly but that is by design.
    e.stopImmediatePropagation();

    let record: MutationRecord;
    let target: IElement;

    switch (e.type) {
      case ElementEvent.ATTR_MODIFIED:
        // http://dom.spec.whatwg.org/#concept-mo-queue-attributes

        const name = e.attrName;
        // @ts-ignore
        const namespace = e.relatedNode.namespaceURI;
        target = e.target as IElement;

        // 1.
        record = getRecord('attributes', target);
        record.attributeName = name;
        record.attributeNamespace = namespace;

        // 2.
        const oldValue =
          e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;

        forEachAncestorAndObserverEnqueueRecord(target, (options) => {
          // 3.1, 4.2
          if (!options.attributes) return;

          // 3.2, 4.3
          if (
            options.attributeFilter &&
            options.attributeFilter.length &&
            options.attributeFilter.indexOf(name) === -1 &&
            options.attributeFilter.indexOf(namespace) === -1
          ) {
            return;
          }
          // 3.3, 4.4
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);

          // 3.4, 4.5
          return record;
        });

        break;

      // case 'DOMCharacterDataModified':
      //   // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
      //   var target = e.target;

      //   // 1.
      //   var record = getRecord('characterData', target);

      //   // 2.
      //   var oldValue = e.prevValue;

      //   forEachAncestorAndObserverEnqueueRecord(target, function(options) {
      //     // 3.1, 4.2
      //     if (!options.characterData)
      //       return;

      //     // 3.2, 4.3
      //     if (options.characterDataOldValue)
      //       return getRecordWithOldValue(oldValue);

      //     // 3.3, 4.4
      //     return record;
      //   });

      //   break;

      case ElementEvent.REMOVED:
      // this.addTransientObserver(e.target as IElement);
      // Fall through.
      case ElementEvent.INSERTED:
        // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
        target = e.relatedNode;
        const changedNode = e.target as IElement;
        let addedNodes: IElement[];
        let removedNodes: IElement[];
        if (e.type === ElementEvent.INSERTED) {
          addedNodes = [changedNode];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [changedNode];
        }
        const { previousSibling } = changedNode;
        const { nextSibling } = changedNode;

        // 1.
        record = getRecord('childList', target);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling as IElement;
        record.nextSibling = nextSibling as IElement;

        forEachAncestorAndObserverEnqueueRecord(target, function (options) {
          // 2.1, 3.2
          if (!options.childList) return;

          // 2.2, 3.3
          return record;
        });
    }

    clearRecords();
  }
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 * @see https://github.com/googlearchive/MutationObservers/blob/master/MutationObserver.js
 */
export class MutationObserver {
  nodes: IElement[] = [];
  records: MutationRecord[] = [];
  uid = uidCounter++;

  constructor(public callback: MutationCallback) {}

  observe(target: DisplayObject, options?: MutationObserverInit) {
    // 1.1
    if (
      (!options.childList && !options.attributes && !options.characterData) ||
      // 1.2
      (options.attributeOldValue && !options.attributes) ||
      // 1.3
      (options.attributeFilter &&
        options.attributeFilter.length &&
        !options.attributes) ||
      // 1.4
      (options.characterDataOldValue && !options.characterData)
    ) {
      throw new SyntaxError();
    }

    let registrations = registrationsTable.get(target);
    if (!registrations) registrationsTable.set(target, (registrations = []));

    // 2
    // If target's list of registered observers already includes a registered
    // observer associated with the context object, replace that registered
    // observer's options with options.
    let registration: Registration;
    for (let i = 0; i < registrations.length; i++) {
      if (registrations[i].observer === this) {
        registration = registrations[i];
        registration.removeListeners();
        registration.options = options;
        break;
      }
    }

    // 3.
    // Otherwise, add a new registered observer to target's list of registered
    // observers with the context object as the observer and options as the
    // options, and add target to context object's list of nodes on which it
    // is registered.
    if (!registration) {
      registration = new Registration(this, target, options);
      registrations.push(registration);
      this.nodes.push(target);
    }

    registration.addListeners();
  }

  disconnect() {
    this.nodes.forEach((node) => {
      const registrations = registrationsTable.get(node);
      for (let i = 0; i < registrations.length; i++) {
        const registration = registrations[i];
        if (registration.observer === this) {
          registration.removeListeners();
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
    this.records = [];
  }

  takeRecords() {
    const copyOfRecords = this.records;
    this.records = [];
    return copyOfRecords;
  }
}

// We keep track of the two (possibly one) records used in a single mutation.
let currentRecord: MutationRecord;
let recordWithOldValue;

/**
 * Creates a record without |oldValue| and caches it as |currentRecord| for
 * later use.
 */
function getRecord(type: MutationRecordType, target: IElement) {
  return (currentRecord = new MutationRecord(type, target));
}

/**
 * Gets or creates a record with |oldValue| based in the |currentRecord|
 */
function getRecordWithOldValue(oldValue: any) {
  if (recordWithOldValue) return recordWithOldValue;
  recordWithOldValue = MutationRecord.copy(currentRecord);
  recordWithOldValue.oldValue = oldValue;
  return recordWithOldValue;
}

function clearRecords() {
  currentRecord = recordWithOldValue = undefined;
}

/**
 * Whether the record represents a record from the current
 * mutation event.
 */
function recordRepresentsCurrentMutation(record: MutationRecord) {
  return record === recordWithOldValue || record === currentRecord;
}

/**
 * Selects which record, if any, to replace the last record in the queue.
 * This returns |null| if no record should be replaced.
 */
function selectRecord(lastRecord: MutationRecord, newRecord: MutationRecord) {
  if (lastRecord === newRecord) return lastRecord;

  // Check if the the record we are adding represents the same record. If
  // so, we keep the one with the oldValue in it.
  if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
    return recordWithOldValue;

  return null;
}

function removeTransientObserversFor(observer: MutationObserver) {
  observer.nodes.forEach((node) => {
    const registrations = registrationsTable.get(node);
    if (!registrations) return;
    registrations.forEach(function (registration) {
      if (registration.observer === observer)
        registration.removeTransientObservers();
    });
  });
}

/**
 * This function is used for the "For each registered observer observer (with
 * observer's options as options) in target's list of registered observers,
 * run these substeps:" and the "For each ancestor ancestor of target, and for
 * each registered observer observer (with options options) in ancestor's list
 * of registered observers, run these substeps:" part of the algorithms. The
 * |options.subtree| is checked to ensure that the callback is called
 * correctly.
 *
 * @param {Node} target
 * @param {function(MutationObserverInit):MutationRecord} callback
 */
function forEachAncestorAndObserverEnqueueRecord(target: IElement, callback) {
  for (let node = target; node; node = node.parentNode as IElement) {
    const registrations = registrationsTable.get(node);

    if (registrations) {
      for (let j = 0; j < registrations.length; j++) {
        const registration = registrations[j];
        const { options } = registration;

        // Only target ignores subtree.
        if (node !== target && !options.subtree) continue;

        const record = callback(options);
        if (record) registration.enqueue(record);
      }
    }
  }
}

// This is used to ensure that we never schedule 2 callas to setImmediate
let isScheduled = false;

// Keep track of observers that needs to be notified next time.
let scheduledObservers: MutationObserver[] = [];

/**
 * Schedules |dispatchCallback| to be called in the future.
 */
function scheduleCallback(observer: MutationObserver) {
  scheduledObservers.push(observer);
  if (!isScheduled) {
    isScheduled = true;
    // setImmediate(dispatchCallbacks);
    if (typeof runtime.globalThis !== 'undefined') {
      runtime.globalThis.setTimeout(dispatchCallbacks);
    } else {
      dispatchCallbacks();
    }
  }
}
function dispatchCallbacks() {
  // http://dom.spec.whatwg.org/#mutation-observers

  isScheduled = false; // Used to allow a new setImmediate call above.

  const observers = scheduledObservers;
  scheduledObservers = [];
  // Sort observers based on their creation UID (incremental).
  observers.sort((o1, o2) => {
    return o1.uid - o2.uid;
  });

  let anyNonEmpty = false;
  observers.forEach(function (observer) {
    // 2.1, 2.2
    const queue = observer.takeRecords();
    // 2.3. Remove all transient registered observers whose observer is mo.
    removeTransientObserversFor(observer);

    // 2.4
    if (queue.length) {
      // @ts-ignore
      observer.callback(queue, observer);
      anyNonEmpty = true;
    }
  });

  // 3.
  if (anyNonEmpty) dispatchCallbacks();
}
