import { Types, defineComponent } from 'bitecs';

export const HIERARCHY = {
  /**
   * The ID of the World entity the owner of this component belongs to
   */
  WORLD: 0,
  /**
   * The ID of the Parent entity. If it has no parent, will match the world ID
   */
  PARENT: 1,
  /**
   * The ID of the next entity in the display list (horizontally, the next sibling)
   */
  NEXT: 2,
  /**
   * The ID of the previous entity in the display list (horizontally, the previous sibling)
   */
  PREV: 3,
  /**
   * The ID of the left-most (first) child entity of this parent
   */
  FIRST: 4,
  /**
   * The ID of the right-most (last) child entity of this parent
   */
  LAST: 5,
  /**
   * The number of direct descendants this entity has
   */
  NUM_CHILDREN: 6,
  /**
   * Reserved to allow for per-child depth sorting outside of the display list index
   */
  DEPTH: 7,
};

export const HierarchyComponent = defineComponent({
  data: [Types.ui32, 8],
});

export function getParentID(id: number): number {
  return HierarchyComponent.data[id][HIERARCHY.PARENT];
}

export function getFirstChildID(parentID: number): number {
  return HierarchyComponent.data[parentID][HIERARCHY.FIRST];
}

export function getLastChildID(parentID: number): number {
  return HierarchyComponent.data[parentID][HIERARCHY.LAST];
}

export function getPreviousSiblingID(id: number): number {
  return HierarchyComponent.data[id][HIERARCHY.PREV];
}

export function getNextSiblingID(id: number): number {
  return HierarchyComponent.data[id][HIERARCHY.NEXT];
}

export function clearHierarchyComponent(id: number): void {
  HierarchyComponent.data[id].fill(0);
}

export function setFirstChildID(parentID: number, childID: number): void {
  HierarchyComponent.data[parentID][HIERARCHY.FIRST] = childID;
}

export function setLastChildID(parentID: number, childID: number): void {
  HierarchyComponent.data[parentID][HIERARCHY.LAST] = childID;
}

export function setNextSiblingID(parentID: number, childID: number): void {
  HierarchyComponent.data[parentID][HIERARCHY.NEXT] = childID;
}

export function setPreviousSiblingID(parentID: number, childID: number): void {
  HierarchyComponent.data[parentID][HIERARCHY.PREV] = childID;
}

export function getParents(id: number): number[] {
  const results = [];

  let currentParent = getParentID(id);

  while (currentParent) {
    results.push(currentParent);
    currentParent = getParentID(currentParent);
  }

  return results;
}

export function clearSiblings(id: number): void {
  setNextSiblingID(id, 0);
  setPreviousSiblingID(id, 0);
}

export function linkSiblings(childA: number, childB: number): void {
  setNextSiblingID(childA, childB);
  setPreviousSiblingID(childB, childA);
}

export function addChildIDAfter(afterID: number, childID: number): void {
  const nextID = getNextSiblingID(afterID);

  if (nextID) {
    linkSiblings(childID, nextID);
  } else {
    //  childID is going to the end of the list
    setNextSiblingID(childID, 0);

    const parentID = getParentID(childID);

    setLastChildID(parentID, childID);
  }

  linkSiblings(afterID, childID);
}

export function addChildIDBefore(beforeID: number, childID: number): void {
  const prevID = getPreviousSiblingID(beforeID);

  if (prevID) {
    linkSiblings(prevID, childID);
  } else {
    //  childID is going to the start of the list
    setPreviousSiblingID(childID, 0);

    const parentID = getParentID(childID);

    setFirstChildID(parentID, childID);
  }

  linkSiblings(childID, beforeID);
}

export function removeChildID(childID: number): void {
  const parentID = getParentID(childID);

  const first = getFirstChildID(parentID);
  const last = getLastChildID(parentID);

  const prevID = getPreviousSiblingID(childID);
  const nextID = getNextSiblingID(childID);

  linkSiblings(prevID, nextID);

  if (first === childID) {
    setFirstChildID(parentID, nextID);
  }

  if (last === childID) {
    setLastChildID(parentID, prevID);
  }

  clearSiblings(childID);
}
