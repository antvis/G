import { Canvas, Text } from '@antv/g';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';

/**
 * Draw emoji with Noto Emoji
 * ported from @see https://codesandbox.io/s/dsiuc?file=/src/index.js
 * @see https://github.com/googlefonts/noto-emoji
 */

const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'Noto Color Emoji',
      url: '/NotoColorEmoji.ttf',
    },
  ],
});

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvaskitRenderer,
});

(async () => {
  await canvas.ready;

  const emoji = new Text({
    style: {
      fontFamily: 'Roboto, Noto Color Emoji',
      fontSize: 30,
      fill: 'black',
      text: 'Emoji 🍕🍔🍟🥝🍱🕶🎩👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧',
      wordWrap: true,
      wordWrapWidth: 200,

      strutStyle: {
        strutEnabled: true,
        fontFamilies: ['Roboto', 'Noto Color Emoji'],
        fontSize: 30,
        // mapping css line-height to this is does not seem 1:1
        heightMultiplier: 1,
        forceStrutHeight: true,
      },
    },
  });
  emoji.translate(100, 300);
  canvas.appendChild(emoji);
})();

// compared with native browser
const newStyle = document.createElement('style');
newStyle.appendChild(
  document.createTextNode(`
@font-face {
  src: url("https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf");
  font-family: "MyRoboto";
  font-style: normal;
}

@font-face {
  font-family: "MyNoto Color Emoji";
  src: url("https://storage.googleapis.com/skia-cdn/misc/NotoColorEmoji.ttf");
  font-style: normal;
}
`),
);
document.head.appendChild(newStyle);

const $div = document.createElement('div');
$div.setAttribute('id', 'editor');
$div.setAttribute('contenteditable', true);
$div.innerHTML = 'Emoji 🍕🍔🍟🥝🍱🕶🎩👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧👩‍👩‍👦👩‍👩‍👧‍👧';
$div.style = `
  font-family: "MyRoboto", "MyNoto Color Emoji";
  line-height: 1;
  font-size: 30px;
  width: 200px;
  color: black;
  margin-left: 100px;
`;
const $wrapper = document.getElementById('container');
$wrapper.appendChild($div);
