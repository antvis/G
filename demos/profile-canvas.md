## canvas 性能对比


---
性能测试和对比
---

````html

<canvas id="c1" width="2000" height="2000" style="width: 1000px; height: 1000px;border:1px solid blue;"></canvas>

<br>
<canvas id="c2" width="2000" height="2000" style="width: 1000px; height: 1000px;border:1px solid blue;"></canvas>

<canvas id="c3" width="100" height="100" style="border: 1px solid red;width:50px;height:50px;"></canvas>

````


````js
const $ = require('jquery');
const canvas = document.getElementById('c1');
const context = canvas.getContext('2d');

const canvas2 = document.getElementById('c2');
const context2 = canvas2.getContext('2d');
const count = 10000;

context.scale(2,2);
context2.scale(2,2);

const map = {};

let points = [];
for(let i = 0; i < count; i++) {
  let obj = {
    x: Math.random() * 1000,
    y: Math.random() * 1000
  };
  points.push(obj);
}

let drawCircle = (ctx, point, color) => {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color || 'red';
  ctx.lineWidth = 1;

  ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);

  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

let t = performance.now();
for(var i = 0; i < count; i ++) {
  let c = document.createElement('canvas');
  c.width = 10;
  c.height = 10;
  var point = points[i];
  let tmCtx = c.getContext('2d');
  //tmCtx.translate(point.x, point.y)
  map[i] = {canvas: c, context: tmCtx};
  drawCircle(tmCtx, {x: 5, y: 5});
}

console.log('create canvas and offscreen draw',performance.now() - t);

t = performance.now();
for(var i = 0; i < count; i ++) {
  var tmp = map[i].canvas;
  var point = points[i];
  context2.drawImage(tmp, point.x, point.y);
}
console.log('drawimage',performance.now() - t);

t = performance.now();

for(var i = 0; i < count; i ++) {
  drawCircle(context, points[i]);
}
console.log('canvas draw', performance.now() - t);

var indexs = [];

function findPoints(x, y) {
  let rst = [];
  for(let i = 0; i < count; i++) {
    let point = points[i];
    if (Math.abs(point.x - x) <= 10 && Math.abs(point.y - y) <= 10){
      rst.push({
        index: i,
        point: point
      });

      indexs.push(i);
    }
  }
  return rst;
}

function update(x, y) {
  let arr = findPoints(x, y);
  context.clearRect(x - 5, y - 5, 10, 10);
  arr.forEach(function(shape){
    var index = shape.index;
    let tmpPoint = points[index];
    drawCircle(context, tmpPoint, 'blue');
  });
 
/* context.clearRect(0, 0, 2000, 2000);
 for(var i = 0; i < count; i ++) {
   var color = indexs.indexOf(i) >= 0 ? 'blue' : 'red';
   drawCircle(context, points[i],color);
 } */
}

t = performance.now();

update(100, 100);

console.log('local refresh', performance.now() - t);

$('#c1').on('mousemove', function(ev) {

  update(ev.offsetX, ev.offsetY);
});

t = performance.now();

let cim = document.createElement('canvas');
let imctx = cim.getContext('2d');
cim.width = 100;
cim.height = 100;

let imdata = imctx.getImageData(0, 0, 10, 10);

console.log('canvas getimage', performance.now() - t);
````

