/**
 * 计算单元格的计算表达式解析和计算
 */
import { toNumber, toString } from './base';

/**
 * Cell 的数据 为 A1: {} BB2: {} 需要分离列 并转为 col, row 索引；
 * 如 AA1 -> [26, 0] AC44 -> [28, 43]
 * @param key
 * @returns 返回索引
 */
export function parseRowColumn(key: string): number[] {
  // 数字是行头，文本是列头
  const rowKey = key.replace(/[a-zA-Z]+/, '');
  const colKey = key.replace(/\d+/, '');

  return [
    toNumber(colKey) - 1, // col
    Number(rowKey) - 1, // row
  ];
}

/**
 * 行列转 key
 * @param col
 * @param row
 * @returns
 */
export function getCellKey(col: number, row: number) {
  return `${row + 1}${toString(col + 1)}`;
}
