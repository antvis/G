import type { AnimationEffectTiming } from '../dom/AnimationEffectTiming';
import { bezier } from './bezier-easing';
import { convertToDash, getEasingFunction } from './custom-easing';

export const linear = (x: number) => {
  return x;
};

const Start = 1;
const Middle = 0.5;
const End = 0;

function step(count: number, pos: number) {
  return function (x: number) {
    if (x >= 1) {
      return 1;
    }
    const stepSize = 1 / count;
    x += pos * stepSize;
    return x - (x % stepSize);
  };
}

const numberString = '\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*';
const cubicBezierRe = new RegExp(
  `cubic-bezier\\(${numberString},${numberString},${numberString},${numberString}\\)`,
);
const step1Re = /steps\(\s*(\d+)\s*\)/;
const step2Re = /steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/;

export function parseEasingFunction(
  normalizedEasing: string,
): (t: number) => number {
  const cubicData = cubicBezierRe.exec(normalizedEasing);
  if (cubicData) {
    // @ts-ignore
    return bezier(...cubicData.slice(1).map(Number));
  }
  const step1Data = step1Re.exec(normalizedEasing);
  if (step1Data) {
    return step(Number(step1Data[1]), End);
  }
  const step2Data = step2Re.exec(normalizedEasing);
  if (step2Data) {
    // @ts-ignore
    return step(
      Number(step2Data[1]),
      { start: Start, middle: Middle, end: End }[step2Data[2]],
    );
  }
  return getEasingFunction(normalizedEasing);
}

export function calculateActiveDuration(timing: EffectTiming) {
  // @ts-ignore
  return Math.abs(repeatedDuration(timing) / (timing.playbackRate || 1));
}

function repeatedDuration(timing: EffectTiming): number {
  // https://drafts.csswg.org/web-animations/#calculating-the-active-duration
  if (timing.duration === 0 || timing.iterations === 0) {
    return 0;
  }

  // @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration#value
  // if (timing.duration === 'auto') {
  //   timing.duration = 0;
  // }

  return (
    (timing.duration === 'auto' ? 0 : Number(timing.duration)) *
    (timing.iterations ?? 1)
  );
}

const PhaseNone = 0;
const PhaseBefore = 1;
const PhaseAfter = 2;
const PhaseActive = 3;

function calculatePhase(
  activeDuration: number,
  localTime: number | null,
  timing: AnimationEffectTiming,
) {
  // https://drafts.csswg.org/web-animations/#animation-effect-phases-and-states
  if (localTime === null) {
    return PhaseNone;
  }

  const { endTime } = timing;
  if (localTime < Math.min(timing.delay, endTime)) {
    return PhaseBefore;
  }
  if (
    localTime >=
    Math.min(timing.delay + activeDuration + timing.endDelay, endTime)
  ) {
    return PhaseAfter;
  }

  return PhaseActive;
}

function calculateActiveTime(
  activeDuration: any,
  fillMode: string,
  localTime: number,
  phase: number,
  delay: number,
) {
  // https://drafts.csswg.org/web-animations/#calculating-the-active-time
  switch (phase) {
    case PhaseBefore:
      if (fillMode === 'backwards' || fillMode === 'both') return 0;
      return null;
    case PhaseActive:
      return localTime - delay;
    case PhaseAfter:
      if (fillMode === 'forwards' || fillMode === 'both') return activeDuration;
      return null;
    case PhaseNone:
      return null;
  }
}

function calculateOverallProgress(
  iterationDuration: number,
  phase: number,
  iterations: number,
  activeTime: number,
  iterationStart: number,
) {
  // https://drafts.csswg.org/web-animations/#calculating-the-overall-progress
  let overallProgress = iterationStart;
  if (iterationDuration === 0) {
    if (phase !== PhaseBefore) {
      overallProgress += iterations;
    }
  } else {
    overallProgress += activeTime / iterationDuration;
  }
  return overallProgress;
}

function calculateSimpleIterationProgress(
  overallProgress: number,
  iterationStart: number,
  phase: number,
  iterations: number,
  activeTime: number,
  iterationDuration: number,
) {
  // https://drafts.csswg.org/web-animations/#calculating-the-simple-iteration-progress

  let simpleIterationProgress =
    overallProgress === Infinity ? iterationStart % 1 : overallProgress % 1;
  if (
    simpleIterationProgress === 0 &&
    phase === PhaseAfter &&
    iterations !== 0 &&
    (activeTime !== 0 || iterationDuration === 0)
  ) {
    simpleIterationProgress = 1;
  }
  return simpleIterationProgress;
}

function calculateCurrentIteration(
  phase: number,
  iterations: number,
  simpleIterationProgress: number,
  overallProgress: number,
) {
  // https://drafts.csswg.org/web-animations/#calculating-the-current-iteration
  if (phase === PhaseAfter && iterations === Infinity) {
    return Infinity;
  }
  if (simpleIterationProgress === 1) {
    return Math.floor(overallProgress) - 1;
  }
  return Math.floor(overallProgress);
}

function calculateDirectedProgress(
  playbackDirection: string,
  currentIteration: number,
  simpleIterationProgress: number,
) {
  // https://drafts.csswg.org/web-animations/#calculating-the-directed-progress
  let currentDirection = playbackDirection;
  if (playbackDirection !== 'normal' && playbackDirection !== 'reverse') {
    let d = currentIteration;
    if (playbackDirection === 'alternate-reverse') {
      d += 1;
    }
    currentDirection = 'normal';
    if (d !== Infinity && d % 2 !== 0) {
      currentDirection = 'reverse';
    }
  }
  if (currentDirection === 'normal') {
    return simpleIterationProgress;
  }
  return 1 - simpleIterationProgress;
}

export function calculateIterationProgress(
  activeDuration: number,
  localTime: number,
  timing: AnimationEffectTiming,
) {
  const phase = calculatePhase(activeDuration, localTime, timing);
  const activeTime = calculateActiveTime(
    activeDuration,
    timing.fill,
    localTime,
    phase,
    timing.delay,
  );
  if (activeTime === null) return null;

  const duration = timing.duration === 'auto' ? 0 : timing.duration;
  const overallProgress = calculateOverallProgress(
    duration,
    phase,
    timing.iterations,
    activeTime,
    timing.iterationStart,
  );
  const simpleIterationProgress = calculateSimpleIterationProgress(
    overallProgress,
    timing.iterationStart,
    phase,
    timing.iterations,
    activeTime,
    duration,
  );
  const currentIteration = calculateCurrentIteration(
    phase,
    timing.iterations,
    simpleIterationProgress,
    overallProgress,
  );

  const directedProgress = calculateDirectedProgress(
    timing.direction,
    currentIteration,
    simpleIterationProgress,
  );

  timing.currentIteration = currentIteration;
  timing.progress = directedProgress;

  // https://drafts.csswg.org/web-animations/#calculating-the-transformed-progress
  // https://drafts.csswg.org/web-animations/#calculating-the-iteration-progress
  return timing.easingFunction(directedProgress);
}

/**
 * From: [https://easings.net]
 * Read More about easings on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/easing)
 */
export const EASINGS: Record<string, string> = {
  in: 'ease-in',
  out: 'ease-out',
  'in-out': 'ease-in-out',

  // Sine
  'in-sine': 'cubic-bezier(0.47, 0, 0.745, 0.715)',
  'out-sine': 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  'in-out-sine': 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',

  // Quad
  'in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'in-out-quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',

  // Cubic
  'in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',

  // Quart
  'in-quart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',

  // Quint
  'in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  'out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
  'in-out-quint': 'cubic-bezier(0.86, 0, 0.07, 1)',

  // Expo
  'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'in-out-expo': 'cubic-bezier(1, 0, 0, 1)',

  // Circ
  'in-circ': 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  'out-circ': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  'in-out-circ': 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',

  // Back
  'in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
export const EasingKeys = Object.keys(EASINGS);

/**
 * Converts users input into a usable easing function string
 */
export const getEase = (ease: keyof typeof EASINGS = 'ease'): string => {
  // Convert camelCase strings into dashed strings, then Remove the "ease-" keyword
  const search = convertToDash(ease).replace(/^ease-/, '');
  return EASINGS[search] || ease;
};
