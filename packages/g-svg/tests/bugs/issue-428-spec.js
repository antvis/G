// const expect = require('chai').expect;
// import Canvas from '../../src/canvas';
// import { simulateMouseEvent, getClientPoint } from '../util';

// const dom = document.createElement('div');
// document.body.appendChild(dom);
// dom.id = 'c1';

// describe('#428', () => {
//   const canvas = new Canvas({
//     container: dom,
//     width: 400,
//     height: 400,
//   });

//   const el = canvas.get('el');

//   it('event should work when matrix is applied', () => {
//     const group = canvas.addGroup();
//     const circle = group.addShape('circle', {
//       attrs: {
//         x: 100,
//         y: 100,
//         r: 50,
//         fill: 'red',
//       },
//     });
//     circle.translate(100, 0);

//     let clickCalled = false;
//     circle.on('click', () => {
//       clickCalled = true;
//     });

//     const { clientX, clientY } = getClientPoint(canvas, 200, 100);
//     simulateMouseEvent(el, 'mousedown', {
//       clientX,
//       clientY,
//     });
//     simulateMouseEvent(el, 'mouseup', {
//       clientX,
//       clientY,
//     });
//     expect(clickCalled).eqls(true);
//   });
// });
