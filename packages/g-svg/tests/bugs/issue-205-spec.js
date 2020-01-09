// const expect = require('chai').expect;
// import Canvas from '../../src/canvas';

// export function simulateMouseEvent(dom, type, cfg) {
//   const event = new MouseEvent(type, cfg);
//   dom.dispatchEvent(event);
// }

// const dom = document.createElement('div');
// document.body.appendChild(dom);
// dom.id = 'c1';

// describe('#205', () => {
//   const canvas = new Canvas({
//     container: dom,
//     width: 500,
//     height: 500,
//   });
//   const el = canvas.get('el');

//   function getClientPoint(x, y) {
//     const point = canvas.getClientByPoint(x, y);
//     return {
//       clientX: point.x,
//       clientY: point.y,
//     };
//   }

//   it('mouseenter and mouseleave should be effective', () => {
//     const group = canvas.addGroup();
//     const shape = group.addShape('circle', {
//       attrs: {
//         x: 100,
//         y: 100,
//         r: 40,
//         fill: 'red',
//       },
//     });
//     let flag = 0;

//     shape.on('mouseenter', () => {
//       flag = 1;
//     });
//     shape.on('mouseleave', () => {
//       flag = 2;
//     });

//     const { clientX, clientY } = getClientPoint(100, 100);
//     simulateMouseEvent(el, 'mouseenter', {
//       clientX,
//       clientY,
//     });
//     expect(flag).eqls(1);
//     simulateMouseEvent(el, 'mouseleave', {
//       clientX: clientX + 50,
//       clientY: clientX + 50,
//     });
//     expect(flag).eqls(2);
//   });
// });
