// Cubic bezier with control points (0, 0), (x1, y1), (x2, y2), and (1, 1).
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const xForT = (t: number) => {
    const omt = 1 - t;
    return 3 * omt * omt * t * x1 + 3 * omt * t * t * x2 + t * t * t;
  };

  const yForT = (t: number) => {
    const omt = 1 - t;
    return 3 * omt * omt * t * y1 + 3 * omt * t * t * y2 + t * t * t;
  };

  const tForX = (x: number) => {
    // Binary subdivision.
    let mint = 0,
      maxt = 1;
    for (let i = 0; i < 30; ++i) {
      const guesst = (mint + maxt) / 2;
      const guessx = xForT(guesst);
      if (x < guessx) {
        maxt = guesst;
      } else {
        mint = guesst;
      }
    }
    return (mint + maxt) / 2;
  };

  return (x: number) => {
    if (x == 0) {
      return 0;
    }
    if (x == 1) {
      return 1;
    }
    return yForT(tForX(x));
  };
}

function stepEnd(nsteps: number) {
  return (x: number) => Math.floor(x * nsteps) / nsteps;
}

function stepStart(nsteps: number) {
  return (x: number) => {
    const result = Math.floor(x * nsteps + 1.0) / nsteps;
    return result > 1.0 ? 1.0 : result;
  };
}

export const gEasingTests = [
  {
    desc: 'step-start function',
    easing: 'step-start',
    easingFunction: stepStart(1),
    serialization: 'steps(1, start)',
  },
  {
    desc: 'steps(1, start) function',
    easing: 'steps(1, start)',
    easingFunction: stepStart(1),
  },
  {
    desc: 'steps(2, start) function',
    easing: 'steps(2, start)',
    easingFunction: stepStart(2),
  },
  {
    desc: 'step-end function',
    easing: 'step-end',
    easingFunction: stepEnd(1),
    serialization: 'steps(1)',
  },
  {
    desc: 'steps(1) function',
    easing: 'steps(1)',
    easingFunction: stepEnd(1),
  },
  {
    desc: 'steps(1, end) function',
    easing: 'steps(1, end)',
    easingFunction: stepEnd(1),
    serialization: 'steps(1)',
  },
  {
    desc: 'steps(2, end) function',
    easing: 'steps(2, end)',
    easingFunction: stepEnd(2),
    serialization: 'steps(2)',
  },
  {
    desc: 'linear function',
    easing: 'linear', // cubic-bezier(0, 0, 1.0, 1.0)
    easingFunction: cubicBezier(0, 0, 1.0, 1.0),
  },
  {
    desc: 'ease function',
    easing: 'ease', // cubic-bezier(0.25, 0.1, 0.25, 1.0)
    easingFunction: cubicBezier(0.25, 0.1, 0.25, 1.0),
  },
  {
    desc: 'ease-in function',
    easing: 'ease-in', // cubic-bezier(0.42, 0, 1.0, 1.0)
    easingFunction: cubicBezier(0.42, 0, 1.0, 1.0),
  },
  {
    desc: 'ease-in-out function',
    easing: 'ease-in-out', // cubic-bezier(0.42, 0, 0.58, 1.0)
    easingFunction: cubicBezier(0.42, 0, 0.58, 1.0),
  },
  {
    desc: 'ease-out function',
    easing: 'ease-out', // cubic-bezier(0, 0, 0.58, 1.0)
    easingFunction: cubicBezier(0, 0, 0.58, 1.0),
  },
  {
    desc: 'easing function which produces values greater than 1',
    easing: 'cubic-bezier(0, 1.5, 1, 1.5)',
    easingFunction: cubicBezier(0, 1.5, 1, 1.5),
  },
  {
    desc: 'easing function which produces values less than 1',
    easing: 'cubic-bezier(0, -0.5, 1, -0.5)',
    easingFunction: cubicBezier(0, -0.5, 1, -0.5),
  },
];

export const gEasingParsingTests = [
  ['linear', 'linear'],
  ['ease-in-out', 'ease-in-out'],
  // polyfill 中交给浏览器 style 进行规范化处理，G 暂不支持
  // ['Ease\\2d in-out', 'ease-in-out'],
  // ['ease /**/', 'ease'],
];

export const gInvalidEasings = [
  '',
  '7',
  'test',
  'initial',
  'inherit',
  'unset',
  'unrecognized',
  'var(--x)',
  'ease-in-out, ease-out',
  'cubic-bezier(1.1, 0, 1, 1)',
  'cubic-bezier(0, 0, 1.1, 1)',
  'cubic-bezier(-0.1, 0, 1, 1)',
  'cubic-bezier(0, 0, -0.1, 1)',
  'cubic-bezier(0.1, 0, 4, 0.4)',
  'steps(-1, start)',
  'steps(0.1, start)',
  'steps(3, nowhere)',
  'steps(-3, end)',
  'function (a){return a}',
  'function (x){return x}',
  'function(x, y){return 0.3}',
];

// Easings that should serialize to the same string
export const gRoundtripEasings = [
  'ease',
  'linear',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(0.1, 5, 0.23, 0)',
  'steps(3, start)',
  'steps(3)',
];
