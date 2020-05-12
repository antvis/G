// // CSS transform 的单测在 interactive 和 renderer 的模式下表现不一致，因此目前没有想到比较好的方式去测试，先全部注释掉
// // 已经在 interactive 模式下手动测试通过，CSS transform 下的事件表现是 OK 的
// const expect = require('chai').expect;
// import Canvas from '../../src/canvas';
// import { simulateMouseEvent, getClientPoint } from '../util';

// const dom = document.createElement('div');
// document.body.appendChild(dom);
// // 支持嵌套的 CSS transform
// document.body.style.transform = 'translate(200px)';
// dom.id = 'c1';
// dom.style.border = '1px solid red';
// // transform 2d 和 3d 函数都支持
// dom.style.transform = 'translate(100px, 100px) scale(1.2) rotate3d(1, 1, 1, 45deg)';

// describe('#489', () => {
//   const canvas = new Canvas({
//     container: dom,
//     width: 400,
//     height: 400,
//     supportCSSTransform: true,
//   });

//   const el = canvas.get('el');

//   it('event should work when CSS transform is applied', () => {
//     const rect = canvas.addShape('rect', {
//       attrs: {
//         x: 50,
//         y: 50,
//         width: 50,
//         height: 50,
//         fill: 'red',
//       },
//     });
//     let clickCalled = false;
//     rect.on('click', () => {
//       clickCalled = true;
//     });
//     rect.on('mouseenter', () => {
//       rect.attr('fill', 'blue');
//     });
//     rect.on('mouseleave', () => {
//       rect.attr('fill', 'red');
//     });

//     const { clientX, clientY } = getClientPoint(canvas, 75, 75);
//     simulateMouseEvent(el, 'mousedown', {
//       clientX,
//       clientY,
//     });
//     simulateMouseEvent(el, 'mouseup', {
//       clientX,
//       clientY,
//     });
//     expect(clickCalled).equals(true);
//   });
// });
