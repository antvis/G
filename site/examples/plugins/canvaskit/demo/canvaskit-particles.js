import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvaskit';

/**
 * Skia’s particle module provides a way to quickly generate large numbers of drawing primitives with dynamic, animated behavior.
 * Particles can be used to create effects like fireworks, spark trails, ambient “weather”, and much more.
 * Nearly all properties and behavior are controlled by scripts written in Skia’s custom language, SkSL
 * @see https://skia.org/docs/user/modules/particles/
 * @see https://particles.skia.org/?nameOrHash=@text
 */

const canvaskitRenderer = new Renderer({
  wasmDir: '/',
});
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvaskitRenderer,
});

const text = {
  MaxCount: 2000,
  Drawable: {
    Type: 'SkCircleDrawable',
    Radius: 1,
  },
  Code: [
    'void effectSpawn(inout Effect effect) {',
    '  effect.rate = 1000;',
    '}',
    '',
    'void spawn(inout Particle p) {',
    '  p.lifetime = mix(1, 3, rand(p.seed));',
    '  float a = radians(mix(250, 290, rand(p.seed)));',
    '  float s = mix(10, 30, rand(p.seed));',
    '  p.vel.x = cos(a) * s;',
    '  p.vel.y = sin(a) * s;',
    '  p.pos += text(rand(p.seed)).xy;',
    '}',
    '',
    'void update(inout Particle p) {',
    '  float4 startColor = float4(1, 0.196, 0.078, 1);',
    '  float4 endColor   = float4(1, 0.784, 0.078, 1);',
    '  p.color = mix(startColor, endColor, p.age);',
    '}',
    '',
  ],
  Bindings: [
    {
      Type: 'SkTextBinding',
      Name: 'text',
      Text: 'AntV',
      FontSize: 96,
    },
  ],
};

const curves = {
  MaxCount: 1000,
  Drawable: {
    Type: 'SkCircleDrawable',
    Radius: 2,
  },
  Code: [
    `
    void effectSpawn(inout Effect effect) {
      effect.rate = 200;
      effect.color = float4(1, 0, 0, 1);
    }
    void spawn(inout Particle p) {
      p.lifetime = 3 + rand(p.seed);
      p.vel.y = -50;
    }

    void update(inout Particle p) {
      float w = mix(15, 3, p.age);
      p.pos.x = sin(radians(p.age * 320)) * mix(25, 10, p.age) + mix(-w, w, rand(p.seed));
      if (rand(p.seed) < 0.5) { p.pos.x = -p.pos.x; }

      p.color.g = (mix(75, 220, p.age) + mix(-30, 30, rand(p.seed))) / 255;
    }
    `,
  ],
  Bindings: [],
};

const fireworks = {
  MaxCount: 300,
  Drawable: {
    Type: 'SkCircleDrawable',
    Radius: 3,
  },
  Code: [
    'void effectSpawn(inout Effect effect) {',
    '  // Phase one: Launch',
    '  effect.lifetime = 4;',
    '  effect.rate = 120;',
    '  float a = radians(mix(-20, 20, rand(effect.seed)) - 90);',
    '  float s = mix(200, 220, rand(effect.seed));',
    '  effect.vel.x = cos(a) * s;',
    '  effect.vel.y = sin(a) * s;',
    '  effect.color.rgb = float3(rand(effect.seed), rand(effect.seed), rand(effect.seed));',
    '  effect.pos.x = 0;',
    '  effect.pos.y = 0;',
    '  effect.scale = 0.25;  // Also used as particle behavior flag',
    '}',
    '',
    'void effectUpdate(inout Effect effect) {',
    '  if (effect.age > 0.5 && effect.rate > 0) {',
    '    // Phase two: Explode',
    '    effect.rate = 0;',
    '    effect.burst = 50;',
    '    effect.scale = 1;',
    '  } else {',
    '    effect.vel.y += dt * 90;',
    '  }',
    '}',
    '',
    'void spawn(inout Particle p) {',
    '  bool explode = p.scale == 1;',
    '',
    '  p.lifetime = explode ? (2 + rand(p.seed) * 0.5) : 0.5;',
    '  float a = radians(rand(p.seed) * 360);',
    '  float s = explode ? mix(90, 100, rand(p.seed)) : mix(5, 10, rand(p.seed));',
    '  p.vel.x = cos(a) * s;',
    '  p.vel.y = sin(a) * s;',
    '}',
    '',
    'void update(inout Particle p) {',
    '  p.color.a = 1 - p.age;',
    '  if (p.scale == 1) {',
    '    p.vel.y += dt * 50;',
    '  }',
    '}',
    '',
  ],
  Bindings: [],
};

const spiral = {
  MaxCount: 800,
  Drawable: {
    Type: 'SkCircleDrawable',
    Radius: 2,
  },
  Code: [
    'void effectSpawn(inout Effect effect) {',
    '  effect.lifetime = 4;',
    '  effect.rate = 120;',
    '  effect.spin = 6;',
    '}',
    '',
    'void spawn(inout Particle p) {',
    '  p.lifetime = 2 + rand(p.seed);',
    '  p.vel = p.dir * mix(50, 60, rand(p.seed));',
    '}',
    '',
    'void update(inout Particle p) {',
    '  p.scale = 0.5 + 1.5 * p.age;',
    '  float3 a0 = float3(0.098, 0.141, 0.784);',
    '  float3 a1 = float3(0.525, 0.886, 0.980);',
    '  float3 b0 = float3(0.376, 0.121, 0.705);',
    '  float3 b1 = float3(0.933, 0.227, 0.953);',
    '  p.color.rgb = mix(mix(a0, a1, p.age), mix(b0, b1, p.age), rand(p.seed));',
    '}',
    '',
  ],
  Bindings: [],
};

const wave = {
  MaxCount: 6000,
  Drawable: {
    Type: 'SkCircleDrawable',
    Radius: 2,
  },
  Code: [
    'void effectSpawn(inout Effect effect) {',
    '  effect.rate = 2000;',
    '}',
    '',
    'void effectUpdate(inout Effect effect) {',
    '}',
    '',
    'void spawn(inout Particle p) {',
    '  p.pos.y += sin(effect.age * 6.28) * 40;',
    '  p.lifetime = 2 + (rand(p.seed) * 2);',
    '  p.vel.x = (30 * rand(p.seed)) + 50;',
    '  p.vel.y = (20 * rand(p.seed)) - 10;',
    '}',
    '',
    'void update(inout Particle p) {',
    '  p.color.r = p.age;',
    '  p.color.g = 1 - p.age;',
    '  float s1 = 0.5 + (1.5 * p.age);',
    '  float s2 = 1.0 + (-0.75 * p.age);',
    '  p.scale = s1 + (s2 - s1) * rand(p.seed);',
    '  p.vel.y += 20.0 * dt;',
    '}',
    '',
  ],
  Bindings: [],
};

(async () => {
  await canvas.ready;

  // curve
  const curveParticles = plugin.createParticles(
    JSON.stringify(curves),
    (canvas) => {
      canvas.translate(100, 250);
    },
  );
  curveParticles.start(Date.now() / 1000.0, true);

  // text
  const textParticles = plugin.createParticles(
    JSON.stringify(text),
    (canvas) => {
      canvas.translate(250, 250);
    },
  );
  textParticles.start(Date.now() / 1000.0, true);

  // fireworks
  const fireworksParticles = plugin.createParticles(
    JSON.stringify(fireworks),
    (canvas) => {
      canvas.translate(100, 350);
    },
  );
  fireworksParticles.start(Date.now() / 1000.0, true);

  // spiral
  const spiralParticles = plugin.createParticles(
    JSON.stringify(spiral),
    (canvas) => {
      canvas.translate(350, 350);
      canvas.scale(0.5, 0.5);
    },
  );
  spiralParticles.start(Date.now() / 1000.0, true);

  // wave
  const waveParticles = plugin.createParticles(
    JSON.stringify(wave),
    (canvas) => {
      canvas.translate(50, 350);
      canvas.scale(0.5, 0.5);
    },
  );
  waveParticles.start(Date.now() / 1000.0, true);
})();
