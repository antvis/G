## 拾取性能对比


---
性能测试和对比
---

````html

<div id="c1"></div>

<div>
  <canvas id="c2" width="2000" height="2000" style="width: 1000px; height: 1000px;border-top:1px solid blue;"></canvas>
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
    // quickCapture: true,
    width: 1000,
    height: 1000
  });

  let drawCircle = (ctx, point) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.lineWidth = 1;
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  let t = performance.now();

  for(let i = 0; i < count; i++) {
    let point = points[i];
    canvas1.addShape('circle', {
      index: point.x + ' ' + point.y,
        attrs: {
        x: point.x,
        y: point.y,
        r: 5,
        fill: 'red'
      }
    });
  }
  console.log(performance.now() - t);
  canvas1.draw();  
  console.log(performance.now() - t);

  /*t = performance.now();
  for(let i = 0; i < count; i++) {
    let point = points[i];
    drawCircle(ctx, point);
  }
  console.log(performance.now() - t);

  t = performance.now();

  var shape = canvas1.getShape(100,100);
  console.log('quick capture',performance.now() - t);

  t = performance.now();

  var shape = canvas1.getShape(200,200);
  console.log('quick capture 2',performance.now() - t);


  t = performance.now();

  var shape = canvas1.getShape(100,100);
  console.log('quick capture 3',performance.now() - t);

  t = performance.now();

  var shape = canvas1.getShape(300,300);
  console.log('quick capture 4',performance.now() - t);
  */
  
  t = performance.now();
  for (let i = 0; i < 50; i++) {
    let x = Math.random() * 1000;
    let y = Math.random() * 1000;
    canvas1.getShape(x,y);
  }
  console.log('total capture',performance.now() - t);
  canvas1.on('click', function() {
    //canvas1.draw(false);
  });
```