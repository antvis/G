import { isNil } from '@antv/util';
import { CellPosition } from '../types/common';

/**
 * 数组转 map，提升检索性能
 * @param indexes
 */
function indexesToMap(indexes: number[]) {
  const map = new Map<number, boolean>();
  const [start, end] = indexes;

  // 如果为空，直接返回空的 map
  if (isNil(start) || isNil(end)) {
    return map;
  }
  for (let idx = start; idx <= end; idx++) {
    map.set(idx, true);
  }
  return map;
}

/**
 * diff 出增删改查
 * @param i1
 * @param i2
 */
export function diffIndexes(curr: number[], next: number[]) {
  // 为了提升性能，先全部传成 map
  const currMap = indexesToMap(curr);
  const nextMap = indexesToMap(next);

  const add = [];
  const update = [];
  const remove = [];

  // update, remove
  const [start, end] = curr;
  const [targetStart, targetEnd] = next;

  for (let i = start; i <= end; i++) {
    if (nextMap.has(i)) {
      update.push(i);
    } else {
      remove.push(i);
    }
  }

  // add
  for (let i = targetStart; i <= targetEnd; i++) {
    if (!currMap.has(i)) {
      add.push(i);
    }
  }

  return { add, update, remove };
}

/**
 * 是否在 视窗索引范围中
 * @param x
 * @param y
 * @param indexes
 */
export function isXYInRange(col: number, row: number, indexes: number[]): boolean {
  const [colMin, colMax, rowMin, rowMax] = indexes;

  return col >= colMin && col <= colMax && row >= rowMin && row <= rowMax;
}

/**
 * 根据一个坐标范围，生成 CellPositions
 * @param indexes
 * @returns
 */
export function generateCellPositions(indexes: number[]): CellPosition[] {
  const [minCol, maxCol, minRow, maxRow] = indexes;
  const r = [];

  for (let col = minCol; col <= maxCol; col++) {
    for (let row = minRow; row <= maxRow; row++) {
      r.push({ row, col });
    }
  }

  return r;
}

/*
┌─────────┐
│         │
│    ┌────┼────┐
│    │    │    │
└────┼────┘    │
     │         │
     └─────────┘
 */
/**
 * 通过行列索引，联合去做 diff
 *
 * @param currIndexes
 * @param nextIndexes
 * @returns
 */
export function diffCellsInView(currIndexes: number[], nextIndexes: number[]) {
  const [currColMin, currColMax, currRowMin, currRowMax] = currIndexes;
  const [nextColMin, nextColMax, nextRowMin, nextRowMax] = nextIndexes;

  const remove = [];
  for (let col = currColMin; col <= currColMax; col++) {
    for (let row = currRowMin; row <= currRowMax; row++) {
      if (!isXYInRange(col, row, nextIndexes)) {
        remove.push({ col, row });
      }
    }
  }

  const add = [];
  for (let col = nextColMin; col <= nextColMax; col++) {
    for (let row = nextRowMin; row <= nextRowMax; row++) {
      if (!isXYInRange(col, row, currIndexes)) {
        add.push({ col, row });
      }
    }
  }

  const update = generateCellPositions([nextColMin, currColMax, nextRowMin, currRowMax]);

  return { add, remove, update };
}
