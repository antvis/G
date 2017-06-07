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
  var PathUitl = require('@ali/g-path-util');
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
    quickCapture: true,
    width: 1000,
    height: 1000
  });

  let drawPath = (ctx, path) => {
    ctx.save();
    ctx.beginPath(); 
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    for(var i = 0; i < path.length; i++) {
      var seg = path[i];
      if (seg[0] === 'M') {
        ctx.moveTo(seg[1], seg[2]);
      } else {
        ctx.lineTo(seg[1], seg[2]);
      }
    }
    ctx.stroke();
    ctx.restore();
  };
  let path = [];
  path.push(['M', points[0].x, points[1].y]);
  for(let i = 1; i < count; i++) {
    let point = points[i];
    path.push(['L', point.x, point.y]);
  }
  let t = performance.now();
  canvas1.addShape('path', {
    attrs: {
      path: path,
      stroke: 'red'
    }
  });
  /*canvas1.addShape('polyline', {
    attrs: {
      points: points,
      stroke: 'red'
    }
  });*/
  console.log(performance.now() - t);
  canvas1.draw();  
  console.log(performance.now() - t);

  t = performance.now();
  drawPath(ctx, path);

  console.log(performance.now() - t);

  t = performance.now();

  PathUitl.toAbsolute(path);
  console.log(performance.now() - t);
```