## 刷新性能对比


---
性能测试和对比
---

````html
<div>
  <canvas id="c2" width="200" height="200" style="width: 100px; height: 100px;border-top:1px solid blue;"></canvas>
</div>

<div id="c1"></div>


````

```js
  let Canvas = require('../index');
  let Util = require('@ali/g-util');

  var canvas = document.getElementById("c2"),
      context = canvas.getContext("2d");
  let count = 12000;
  let points = [];
  for(let i = 0; i < count; i++) {
    let obj = {
      x: 0,
      y: 0,
      xloc: 0,
      yloc: 0,
      xvel: 0,
      yvel: 0,
    };
    points.push(obj);
  }
  
  let canvas1 = new Canvas({
    containerId: 'c1',
    // quickCapture: true,
    width: 1000,
    height: 1000
  });

  let t = performance.now();
  let circles = [];
  for(let i = 0; i < count; i++) {
    let point = points[i];
    let c = canvas1.addShape('rect', {
      index: point.x + ' ' + point.y,
        attrs: {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'red'
      }
    });
    circles.push(c);
  }
  console.log(performance.now() - t);
  canvas1.draw();  
  console.log(performance.now() - t);
  
  showAnimate();
  gameLoop();

  function mapX(val) {
      return (val + 5) / 10 * 1000;
  }

  function mapY(val) {
      return (val + 5) / 10 * 1000;
  }

  function showAnimate() {
    for (let j = 0; j < count; j ++) {
      let d = points[j];
      let c = circles[j];
      let attrs = c.__attrs;
      d.xloc += d.xvel;
      d.yloc += d.yvel;
      d.xvel += 0.04 * (Math.random() - .5) - 0.05 * d.xvel - 0.0005 * d.xloc;
      d.yvel += 0.04 * (Math.random() - .5) - 0.05 * d.yvel - 0.0005 * d.yloc;
      var size = Math.min(1 + 1000 * Math.abs(d.xvel * d.yvel), 10);
      attrs.width = size;
      attrs.height = size;
      attrs.x = mapX(d.xloc);
      attrs.y = mapY(d.yloc);

      /*let size = Math.random() * 10;
      c.attr({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        width: size,
        height: size
      });*/
    }
    canvas1.draw();

    window.requestAnimationFrame(showAnimate);
  }
  context.fillStyle = "Black";
  context.font      = "normal 16pt Arial";
  function showFPS() {
    context.clearRect(0, 0, 200, 200);
    context.fillText(fps + " fps", 10, 26);
  }

  var lastRun;
  var fps;
  var show_fps = true;
  var game_running = true;
  var fpsCont = 0;
  function gameLoop(){
        if(!lastRun) {
            lastRun = new Date().getTime();
            requestAnimationFrame(gameLoop);
            return;
        }
        var delta = (new Date().getTime() - lastRun)/1000;
        lastRun = new Date().getTime();
        fps = 1/delta;
        fpsCont++;
        if (show_fps && fpsCont % 10 === 0) {

          showFPS();
        }

        if (game_running) requestAnimationFrame(gameLoop);

    }

```