## marker 性能对比


---
性能测试和对比
---

````html

<div id="c1"></div>

<div>
  <canvas id="c2" width="2000" height="2000" style="width: 1000px; height: 1000px;"></canvas>
</div>

````

```js
  let Canvas = require('../index');
  let Util = require('@ali/g-util');
  let count = 10000;
  let points = [];
  let ctx = document.getElementById('c2').getContext('2d');
  ctx.scale(2, 2);
  for(let i = 0; i < count; i++) {
    let obj = {
      x: Math.random() * 1000,
      y: Math.random() * 1000
    };
    points.push(obj);
  }
  
  let canvas1 = new Canvas({
    containerId: 'c1',
    width: 1000,
    quickCapture: true,
    height: 1000
  });

  let drawCircle = (ctx, point) => {
    ctx.save();
    ctx.beginPath();
    var x = point.x;
    var y = point.y;
    ctx.fillStyle = 'red';
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x + 10, y + 10);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  let t = performance.now();

  for(let i = 0; i < count; i++) {
    let point = points[i];
    canvas1.addShape('marker', {
      attrs: {
        x: point.x,
        y: point.y,
        radius: 5,
        symbol: 'square',
        fill: 'red'
      }
    });
  }

  console.log(performance.now() - t);

  canvas1.draw();
  console.log(performance.now() - t);
  
  t = performance.now();
  for(let i = 0; i < count; i++) {
    let point = points[i];
    drawCircle(ctx, point);
  }

  console.log(performance.now() - t);
  
  canvas1.on('click',function(ev) {
    console.log(ev.currentTarget);
  });

```