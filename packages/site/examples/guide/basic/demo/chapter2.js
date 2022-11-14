import { Canvas, CanvasEvent, Circle, Line, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

// create a renderer
const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const node1 = new Circle({
  style: {
    r: 40,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const text1 = new Text({
  style: {
    text: 'Node1', // 文本内容
    fontFamily: 'Avenir', // 字体
    fontSize: 22, // 字号
    fill: '#fff', // 文本颜色
    textAlign: 'center', // 水平居中
    textBaseline: 'middle', // 垂直居中
  },
});
node1.appendChild(text1);
node1.setPosition(200, 200);

const node2 = new Circle({
  style: {
    r: 40,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const text2 = new Text({
  style: {
    text: 'Node2', // 文本内容
    fontFamily: 'Avenir', // 字体
    fontSize: 22, // 字号
    fill: '#fff', // 文本颜色
    textAlign: 'center', // 水平居中
    textBaseline: 'middle', // 垂直居中
  },
});
node2.appendChild(text2);
node2.setPosition(400, 200);

const edge = new Line({
  style: {
    x1: 200,
    y1: 200,
    x2: 400,
    y2: 200,
    stroke: '#1890FF',
    lineWidth: 2,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(edge);
  canvas.appendChild(node1);
  canvas.appendChild(node2);
});
