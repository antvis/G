import { Canvas } from '@antv/g-renderer-canvas';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

// const canvas = new Canvas({
//   container: 'container',
//   width: 600,
//   height: 500,
// });

// const group = canvas.addGroup();

// const nodeGroup = group.addGroup();
// nodeGroup.setMatrix([1, 0, 0, 0, 1, 0, 251, 250, 1]);

// const text = nodeGroup.addShape('text', {
//   attrs: {
//     fill: "#000",
//     fillOpacity: 0.9,
//     font: `normal normal normal 12px Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
//     // fontFamily: `Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
//     // fontFamily: 'Arial, sans-serif',
//     // fontFamily: 'sans-serif',
//     fontFamily: 'Avenir',
//     // fontFamily: 'Times',
//     // fontFamily: 'Microsoft YaHei',
//     fontSize: 22,
//     fontStyle: "normal",
//     fontVariant: "normal",
//     fontWeight: "normal",
//     lineAppendWidth: 0,
//     lineWidth: 1,
//     matrix: null,
//     opacity: 1,
//     strokeOpacity: 1,
//     text: "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz审核",
//     textAlign: "center",
//     textBaseline: "bottom",
//     x: 0,
//     y: -14
//   },
// });

// const circle = nodeGroup.addShape('circle', {
//   attrs: {
//     fill: "rgb(239, 244, 255)",
//     fillOpacity: 1,
//     lineAppendWidth: 0,
//     lineWidth: 1,
//     matrix: null,
//     opacity: 1,
//     r: 10,
//     stroke: "rgb(95, 149, 255)",
//     strokeOpacity: 1,
//     x: 0,
//     y: 0,
//   },
//   className: 'rect-keyShape',
//   name: 'rect-keyShape',
//   draggable: true,
// })

// let offsetX = 0;
// let offsetY = 0;
// circle.on('dragstart', e => {
//   const groupMatrix = nodeGroup.getMatrix();
//   offsetX = e.x - groupMatrix[6];
//   offsetY = e.y - groupMatrix[7];
//   console.log('dragsetart', offsetX, offsetY)
// })
// circle.on('drag', e => {
//   const newMatrix = [1, 0,0, 0, 1, 0, e.x-offsetX, e.y-offsetY, 1]
//   nodeGroup.setMatrix(newMatrix)
// })

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
});
