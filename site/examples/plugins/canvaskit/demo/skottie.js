import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-canvaskit';

/**
 * Skottie is a performant, secure native player for JSON animations derived from the Bodymovin plugin for After Effects.
 * @see https://skia.org/docs/user/modules/skottie/
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

(async () => {
  const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

  const [
    _,
    legoJSON,
    confettiJSON,
    drinkJSON,
    multiframeJSON,
    flightGif,
    onboardingJSON,
    twitterJSON,
  ] = await Promise.all([
    canvas.ready,
    fetch(cdn + 'lego_loader.json').then((response) => response.text()),
    fetch(cdn + 'confetti.json').then((response) => response.text()),
    fetch(cdn + 'drinks.json').then((response) => response.text()),
    fetch(cdn + 'skottie_sample_multiframe.json').then((response) =>
      response.text(),
    ),
    fetch(cdn + 'flightAnim.gif').then((response) => response.arrayBuffer()),
    fetch(cdn + 'onboarding.json').then((response) => response.text()),
    fetch('/lottie/twitter-favorite-heart.json').then((response) =>
      response.text(),
    ),
  ]);

  plugin.playAnimation('sk_legos', legoJSON, [-100, -100, 300, 300]);
  plugin.playAnimation('sk_party', confettiJSON, [200, -100, 400, 400]);
  plugin.playAnimation('sk_drink', drinkJSON, [0, 200, 200, 400]);
  plugin.playAnimation(
    'sk_animated_gif',
    multiframeJSON,
    [200, 200, 400, 400],
    {
      'image_0.png': flightGif,
    },
  );
  plugin.playAnimation('sk_onboarding', onboardingJSON, [350, 0, 550, 200]);
  plugin.playAnimation('sk_twitter', twitterJSON, [400, 200, 600, 400]);
})();
