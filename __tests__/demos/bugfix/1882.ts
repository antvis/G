import { Canvas, Rect } from '@antv/g';
import '@antv/g-web-components';

/**
 * @see https://github.com/antvis/G/issues/1882
 */
export async function issue_1882(context: { canvas: Canvas }) {
  const { canvas } = context;
  await canvas.ready;

  const domContainer = (
    canvas.getContextService().getDomElement() as unknown as HTMLElement
  ).parentElement;
  canvas.destroy();

  domContainer.innerHTML = `
      <g-canvas renderer="canvas" width="400" height="400">
        <g-rect
            fill="#2f54eb"
            x="12"
            y="24"
            width="200"
            height="50"
        >
          <g-circle fill="#adc6ff" r="16" cx="25" cy="25"></g-circle>
          <g-text fill="#fff" x="50" y="20">我是一段文字</g-text>
        </g-rect>
        <g-html x="10" y="200" width="120" height="400">
          <div>
            <h2>hahahah</h2>
            <hr />
            <p>bsdkjfbkjsadbfkjabnjfnalsjkfnkja</p>
          </div>
        </g-html>
        <g-path
          transform="translate(0, 100)"
          stroke="#2f54eb"
          d="M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10"
        ></g-path>
      </g-canvas>
  `;
}
