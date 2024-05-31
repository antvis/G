import { Canvas, CanvasEvent, Group, Image, Path, Rect } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: new Renderer(),
  background: 'rgb(16, 22, 29)',
});

const gradient =
  'linear-gradient(-90deg, rgba(178, 230, 181, 0), rgba(178, 230, 181, 0.6) 14%, rgba(166, 221, 179, 0.82) 23%, rgba(101, 171, 170, 0.9) 67%, rgb(23, 80, 157))';
// 'l(270) 0:rgba(178, 230, 181, 0) 0.14:rgba(178, 230, 181, 0.6) 0.23:rgba(166, 221, 179, 0.82) 0.67:rgba(101, 171, 170, 0.9) 1:rgb(23, 80, 157)';

const rippleData = [
  {
    top: 'M46.33 48.5C46.33 48.5 46.33 48.5 46.33 48.5C46.41 47.25 51.01 46.24 56.67 46.24C62.33 46.24 66.93 47.24 67.02 48.5L67.02 48.5C67.02 47.24 62.39 46.21 56.67 46.21C50.95 46.21 46.33 47.24 46.33 48.5Z',
    bottom:
      'M56.68 51C51 51 46.42 50 46.34 48.74C46.34 48.74 46.34 48.74 46.34 48.74C46.34 50.01 50.98 51.03 56.69 51.03C62.4 51.03 67 50 67 48.77L67 48.77C66.94 50 62.35 51 56.68 51Z',
    stroke: '#b0dacc',
    strokeOpacity: 1,
    scale: 3,
    durationMultiplier: 2,
  },
  {
    top: 'M32 48.31C32 48.31 32 48.37 32 48.39C32.21 45.39 43.19 43.01 56.72 43.01C70.25 43.01 81.24 45.41 81.44 48.39C81.44 48.39 81.44 48.39 81.44 48.31C81.44 45.31 70.37 42.84 56.71 42.84C43.05 42.84 32 45.29 32 48.31Z',
    bottom:
      'M56.68 54.26C43.15 54.26 32.17 51.86 31.96 48.88C31.96 48.88 31.96 48.94 31.96 48.97C31.96 51.97 43.04 54.43 56.69 54.43C70.34 54.43 81.41 52 81.41 49C81.41 49 81.41 48.94 81.41 48.91C81.2 51.86 70.21 54.26 56.68 54.26Z',
    stroke: '#b0dacc',
    strokeOpacity: 1,
    scale: 1.8,
  },
  {
    top: 'M23.62 48.2C23.62 48.2 23.62 48.27 23.62 48.31C23.89 44.31 38.62 41.11 56.67 41.11C74.72 41.11 89.45 44.33 89.72 48.31A0.43 0.43 0 0 0 89.72 48.2C89.72 44.2 74.91 40.89 56.65 40.89C38.39 40.89 23.62 44.16 23.62 48.2Z',
    bottom:
      'M56.68 56.16C38.59 56.16 23.9 52.95 23.68 48.96C23.68 48.96 23.68 49.04 23.68 49.08C23.68 53.08 38.48 56.39 56.74 56.39C75 56.39 89.81 53.11 89.81 49.08A0.5 0.5 0 0 0 89.81 48.96C89.46 53 74.77 56.16 56.68 56.16Z',
    stroke: '#b0dacc',
    strokeOpacity: 0.8,
    scale: 1.5,
  },
  {
    top: 'M19 48.14A0.69 0.69 0 0 0 19 48.27C19.3 43.73 36 40.07 56.62 40.07C77.24 40.07 94 43.73 94.31 48.27C94.31 48.22 94.31 48.18 94.31 48.14C94.31 43.54 77.45 39.82 56.66 39.82C35.87 39.82 19 43.54 19 48.14Z',
    bottom:
      'M56.68,57.2c-20.59,0-37.32-3.65-37.62-8.19a.51.51,0,0,0,0,.13c0,4.59,16.85,8.32,37.64,8.32s37.65-3.73,37.65-8.32c0,0,0-.09,0-.13C94,53.55,77.28,57.2,56.68,57.2Z',
    stroke: '#b0dacc',
    strokeOpacity: 0.57,
    scale: 1.2,
  },
  {
    top: 'M14.24 48.07C14.24 48.07 14.24 48.17 14.24 48.22C14.6 43.1 33.46 39 56.68 39C79.9 39 98.76 43.12 99.11 48.24A0.77 0.77 0 0 0 99.11 48.09C99.11 42.91 80.11 38.71 56.66 38.71C33.21 38.71 14.24 42.89 14.24 48.07Z',
    bottom:
      'M56.68 58.3C33.46 58.3 14.6 54.17 14.25 49.06C14.25 49.06 14.25 49.15 14.25 49.2C14.25 54.38 33.25 58.58 56.69 58.58C80.13 58.58 99.14 54.38 99.14 49.2A0.59 0.59 0 0 0 99.14 49.06C98.76 54.17 79.91 58.3 56.68 58.3Z',
    stroke: '#b0dacc',
    strokeOpacity: 0.5,
    scale: 1.3,
  },
  {
    top: 'M7.12 48.24A1.11 1.11 0 0 0 7.12 48.41C7.52 42.41 29.54 37.62 56.66 37.62C83.78 37.62 105.8 42.43 106.21 48.41C106.21 48.35 106.21 48.29 106.21 48.24C106.21 42.19 84.02 37.24 56.64 37.24C29.26 37.24 7.12 42.19 7.12 48.24Z',
    bottom:
      'M56.68 60.17C29.56 60.17 7.54 55.36 7.14 49.38A1.11 1.11 0 0 0 7.14 49.55C7.14 55.6 29.33 60.55 56.7 60.55C84.07 60.55 106.27 55.64 106.27 49.55C106.27 49.55 106.27 49.44 106.27 49.38C105.82 55.36 83.8 60.17 56.68 60.17Z',
    stroke: '#b0dacc',
    strokeOpacity: 0.23,
    scale: 1.2,
  },
];

const group = new Group();
const mountain1 = new Path({
  // @see https://g-next.antv.vision/zh/docs/api/basic/display-object#classname
  className: 'mountain',
  style: {
    d: 'M33.6,51S44.36,31.65,48.15,18,64.38,7.42,66.62,18s10.6,33.6,13.15,33.1Z',
    fill: gradient,
    stroke: '#efcb84',
    strokeWidth: 0.5,
    miterLimit: 10,
    shadowColor: 'rgba(124,94,44,0.5)',
    shadowBlur: 50,
    // @see https://g-next.antv.vision/zh/docs/api/basic/display-object#%E8%A3%81%E5%89%AA
    // clipPath: new Rect({
    //   style: {
    //     y: -10,
    //     x: -10,
    //     width: 60,
    //     height: 51,
    //   },
    // }),
  },
});

const mountain2 = mountain1.cloneNode();
mountain2.translateLocal(20, 10);
mountain2.scale(0.8);

group.appendChild(mountain2);
group.appendChild(mountain1);

// @see https://g-next.antv.vision/zh/docs/api/basic/display-object#%E9%AB%98%E7%BA%A7%E6%9F%A5%E8%AF%A2
const mountains = group.querySelectorAll('.mountain');
mountains.forEach((mountain) => {
  mountain.addEventListener('click', () => {
    mountains.forEach((m) => {
      m.style.strokeWidth = 0.5;
    });
    mountain.style.strokeWidth = 2;
  });
});

const rippleGroups = rippleData.map(
  ({ top, bottom, stroke, strokeOpacity }) => {
    const rippleGroup = new Group({
      style: {
        strokeOpacity,
        // @see https://g-next.antv.vision/zh/docs/api/basic/display-object#pointerevents
        pointerEvents: 'none',
      },
    });
    const topRipple = new Path({
      style: {
        d: top,
        stroke,
        strokeWidth: 0.5,
        miterLimit: 10,
      },
    });
    const bottomRipple = new Path({
      style: {
        d: bottom,
        stroke,
        strokeWidth: 0.5,
        miterLimit: 10,
      },
    });
    rippleGroup.appendChild(topRipple);
    rippleGroup.appendChild(bottomRipple);
    group.appendChild(rippleGroup);

    return rippleGroup;
  },
);

const boat = new Image({
  style: {
    width: 100,
    height: 100,
    opacity: 0,
    anchor: '0.5 0.5',
    src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qdRtSanFh_4AAAAAAAAAAAAAARQnAQ',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(group);
  canvas.appendChild(boat);

  rippleGroups.forEach((rippleGroup, i) => {
    const { center } = rippleGroup.getBounds();
    rippleGroup.style.transformOrigin = `${center[0]}px ${center[1]}px`;
    rippleGroup.animate(
      [
        {
          transform: 'scale(0.001)',
          strokeOpacity: rippleData[i].strokeOpacity,
        },
        {
          transform: `scale(${rippleData[i].scale})`,
          strokeOpacity: 0,
        },
      ],
      {
        duration: 1500 * (rippleData[i].durationMultiplier || 1),
        iterations: Infinity,
        delay: i * 150,
      },
    );
  });

  group.scale(4);
});

// canvas.addEventListener("click", function (e) {
//   // @see https://g-next.antv.vision/zh/docs/api/event#canvasxy
//   boat.style.x = e.canvasX;
//   boat.style.y = e.canvasY;
//   boat.animate([{ opacity: 0 }, { opacity: 1 }], {
//     duration: 500,
//     // @see https://g-next.antv.vision/zh/docs/api/animation#fill
//     fill: "both"
//   });
// });
