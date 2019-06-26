const expect = require('chai').expect;
import { parseRadius } from '../../../src/util/parse';
import Rect from '../../../src/shape/rect';
import { getColor } from '../../get-color';

const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

describe('parse util test', () => {
  it('parse radius', () => {
    expect(parseRadius(10)).eqls([ 10, 10, 10, 10 ]);
    expect(parseRadius([ 10 ])).eqls([ 10, 10, 10, 10 ]);
    expect(parseRadius([ 10, 5 ])).eqls([ 10, 5, 10, 5 ]);
    expect(parseRadius([ 10, 5, 3 ])).eqls([ 10, 5, 3, 5 ]);
  });

  it('parse linear gradient', () => {
    const rect = new Rect({
      type: 'rect',
      attrs: {
        x: 10,
        y: 10,
        width: 100,
        height: 2,
        fill: 'l(0) 0:#ffffff 1:#ff0000'
      }
    });
    rect.draw(ctx);
    expect(getColor(ctx, 10, 11)).eqls('#fffefe');
    expect(getColor(ctx, 60, 11)).eqls('#ff7f7f');
    expect(getColor(ctx, 100, 11)).eqls('#ff1919');
  });

  it('parse linear gradient 90', () => {
    const rect = new Rect({
      type: 'rect',
      attrs: {
        x: 20,
        y: 20,
        width: 2,
        height: 100,
        fill: 'l(90) 0:#ffffff 1:#ff0000'
      }
    });
    rect.draw(ctx);
    expect(getColor(ctx, 21, 20)).eqls('#fffdfd');
    expect(getColor(ctx, 21, 70)).eqls('#ff7e7e');
    expect(getColor(ctx, 21, 119)).eqls('#ff0101');
  });

  it('parse circle gradient', () => {
    const rect = new Rect({
      type: 'rect',
      attrs: {
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        stroke: 'blue',
        fill: 'r(0.5, 0.5, 1) 0:#ffffff 1:#ff0000'
      }
    });
    rect.draw(ctx);
    expect(getColor(ctx, 100, 100)).eqls('#fffcfc');
    expect(getColor(ctx, 100, 50)).eqls('#7f27a7');
  });

  it('parse pattern', (done) => {
    const rect = new Rect({
      type: 'rect',
      attrs: {
        x: 110,
        y: 110,
        width: 100,
        height: 100,
        fill: 'p(a) data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0Ni4yICg0NDQ5NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+QXJ0Ym9hcmQ8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0ibG9nbyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkFydGJvYXJkIj4KICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLjAwMDAwMCwgNzAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyBpZD0i5b2p6ImyIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTA1Ljg4NDEwMSw0LjMzMDEyNTgzIEwxMDUuODg0MTAxLDAuNDgxMTI1MDkzIEw4My40MTE3NjQ3LDAuNDgxMTI1MDkzIEw4My40MTE3NjQ3LDAuNDgxMTI1MDkzIEM4MS4yMDI2MjU3LDAuNDgxMTI1MDkzIDc5LjQxMTc2NDcsMi4yNzE5ODYwOSA3OS40MTE3NjQ3LDQuNDgxMTI1MDkgTDc5LjQxMTc2NDcsMzMuMTk1OTkwMyBMODMuMjYyMDMyMSwzMy4xOTU5OTAzIEw4My4yNjIwMzIxLDYuMzMwMTI1ODMgTDgzLjI2MjAzMjEsNi4zMzAxMjU4MyBDODMuMjYyMDMyMSw1LjIyNTU1NjMzIDg0LjE1NzQ2MjYsNC4zMzAxMjU4MyA4NS4yNjIwMzIxLDQuMzMwMTI1ODMgTDEwNS44ODQxMDEsNC4zMzAxMjU4MyBaIiBpZD0iUGF0aC0zLUNvcHktNSIgZmlsbD0iIzAwMDAwMCIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IlBhdGgtMi1Db3B5LTQiIGZpbGw9IiMxMDhFRTkiIHBvaW50cz0iMCA2MC4xNDA2MzY2IDI1LjUwODAyMTQgMTUuODc3MTI4MSA1MS4wMTYwNDI4IDYwLjE0MDYzNjYiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTEuMDcyNTA5MSwzMS4yMTkxMTkxIEwyMy43OTUwNDY3LDkuMjQ0MjE0NjQgTDIzLjc5NTA0NjcsOS4yNDQyMTQ2NCBDMjQuMzQ4NDgzNCw4LjI4ODI5NTQgMjUuNTcyMDU4MSw3Ljk2MjAxODgyIDI2LjUyNzk3NzQsOC41MTU0NTU1MiBDMjYuODMwMzkwMSw4LjY5MDUzOTY2IDI3LjA4MTY1MjQsOC45NDE4MDE5MiAyNy4yNTY3MzY1LDkuMjQ0MjE0NjQgTDQwLjAxMDU0NDcsMzEuMjczMTMxIEw0MC4wMzM5MjMsMzEuMjczMTMxIEw0My4zMjQ5ODg5LDI5LjM3MzAzMzIgTDI4Ljk0NTI4NTMsNC41MzU4MDE2IEMyOC41OTUxMTcsMy45MzA5NzYxNiAyOC4wOTI1OTI1LDMuNDI4NDUxNjQgMjcuNDg3NzY3LDMuMDc4MjgzMzYgQzI1LjU3NTkyODUsMS45NzE0MDk5NyAyMy4xMjg3NzksMi42MjM5NjMxMSAyMi4wMjE5MDU3LDQuNTM1ODAxNiBMMjIuMDIxOTA1Nyw0LjUzNTgwMTYgTDcuNzAwNTIxNTYsMjkuMjcyMzAxMiBMMTEuMDcyNTA5MSwzMS4yMTkxMTkxIFoiIGlkPSJDb21iaW5lZC1TaGFwZSIgZmlsbD0iIzAwMDAwMCI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNDIuOTQ0MjIxLDMzLjE0MzYxOTUgTDE1Ny4zOTc2MDQsOC4xNzkxMjY1NyBMMTcxLjg4MjI1NywzMy4xOTc2MzE0IEwxNzEuOTA1NjM1LDMzLjE5NzYzMTQgTDE3NS4xOTY3MDEsMzEuMjk3NTMzNiBMMTU3LjM1NTMwOCwwLjQ4MTEyNTA5MyBMMTM5LjU3MjIzNCwzMS4xOTY4MDE2IEwxNDIuOTQ0MjIxLDMzLjE0MzYxOTUgWiIgaWQ9IkNvbWJpbmVkLVNoYXBlLUNvcHkiIGZpbGw9IiMwMDAwMDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1Ny4zODQ0NjcsIDE2LjgzOTM3OCkgcm90YXRlKDE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtMTU3LjM4NDQ2NywgLTE2LjgzOTM3OCkgIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS0zLUNvcHkiIGZpbGw9IiNGRkJGMDAiIHg9IjcxLjIyOTk0NjUiIHk9IjE2LjgzOTM3ODIiIHdpZHRoPSI0My4zMTU1MDgiIGhlaWdodD0iNDMuMzAxMjU4MyI+PC9yZWN0PgogICAgICAgICAgICAgICAgICAgIDxlbGxpcHNlIGlkPSJPdmFsLUNvcHkiIGZpbGw9IiNGMDQxMzQiIGN4PSIxNTcuMzc5Njc5IiBjeT0iMzguMDA4ODgyMyIgcng9IjIyLjYyMDMyMDkiIHJ5PSIyMi42MTI4NzkzIj48L2VsbGlwc2U+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=='
      }
    });

    rect.draw(ctx);
    expect(getColor(ctx, 111, 111)).eqls('#000000');
    setTimeout(function() {
      ctx.clearRect(110, 110, 100, 100);
      rect.draw(ctx);
      expect(getColor(ctx, 111, 111)).not.eqls('#000000');
      done();
    }, 20);
  });

});

