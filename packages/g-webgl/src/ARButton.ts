import { Canvas } from '@antv/g-lite';
import { Renderer } from '.';

/**
 * @see https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/ARButton.js
 * @example
 *
 * import { ARButton } from '@antv/g-webgl';
 * const $button = ARButton.createButton(renderer, { domOverlay: { root: document.body } });
 */
export class ARButton {
  static createButton(
    canvas: Canvas,
    renderer: Renderer,
    sessionInit: XRSessionInit = {},
  ) {
    const button = document.createElement('button');

    const disableButton = () => {
      button.style.display = '';

      button.style.cursor = 'auto';
      button.style.left = 'calc(50% - 75px)';
      button.style.width = '150px';

      button.onmouseenter = null;
      button.onmouseleave = null;

      button.onclick = null;
    };

    const showARNotSupported = () => {
      disableButton();
      button.textContent = 'AR NOT SUPPORTED';
    };

    const showARNotAllowed = (exception: Error) => {
      disableButton();

      console.warn(
        'Exception when trying to call xr.isSessionSupported',
        exception,
      );

      button.textContent = 'AR NOT ALLOWED';
    };

    const stylizeElement = (element: HTMLElement) => {
      element.style.position = 'absolute';
      element.style.bottom = '20px';
      element.style.padding = '12px 6px';
      element.style.border = '1px solid #fff';
      element.style.borderRadius = '4px';
      element.style.background = 'rgba(0,0,0,0.1)';
      element.style.color = '#fff';
      element.style.font = 'normal 13px sans-serif';
      element.style.textAlign = 'center';
      element.style.opacity = '0.5';
      element.style.outline = 'none';
      element.style.zIndex = '999';
    };

    const showStartAR = () => {
      let currentSession: XRSession;
      button.style.display = '';
      button.style.cursor = 'pointer';
      button.style.left = 'calc(50% - 50px)';
      button.style.width = '100px';
      button.textContent = 'START AR';

      const onSessionEnded = () => {
        currentSession.removeEventListener('end', onSessionEnded);

        button.textContent = 'START AR';
        (sessionInit.domOverlay.root as HTMLElement).style.display = 'none';
        currentSession = undefined;
      };

      const onSessionStarted = async (session: XRSession) => {
        session.addEventListener('end', onSessionEnded);

        renderer.xr.setReferenceSpaceType('local');

        await renderer.xr.setSession(canvas, session);

        button.textContent = 'STOP AR';
        (sessionInit.domOverlay.root as HTMLElement).style.display = '';
        currentSession = session;
      };

      if (sessionInit.domOverlay === undefined) {
        const overlay = document.createElement('div');
        overlay.style.display = 'none';
        document.body.appendChild(overlay);

        const svg = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg',
        );
        svg.setAttribute('width', '38');
        svg.setAttribute('height', '38');
        svg.style.position = 'absolute';
        svg.style.right = '20px';
        svg.style.top = '20px';
        svg.addEventListener('click', function () {
          currentSession.end();
        });
        overlay.appendChild(svg);

        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        );
        path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28');
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '2');
        svg.appendChild(path);

        if (sessionInit.optionalFeatures === undefined) {
          sessionInit.optionalFeatures = [];
        }

        sessionInit.optionalFeatures.push('dom-overlay');
        sessionInit.domOverlay = { root: overlay };
      }

      /**
       * Bind event listeners to button.
       */
      button.onclick = () => {
        if (!currentSession) {
          navigator.xr
            .requestSession('immersive-ar', sessionInit)
            .then(onSessionStarted);
        } else {
          currentSession.end();
        }
      };
      button.onmouseenter = () => {
        button.style.opacity = '1.0';
      };
      button.onmouseleave = () => {
        button.style.opacity = '0.5';
      };
    };

    if ('xr' in navigator) {
      button.id = 'ARButton';
      button.style.display = 'none';

      stylizeElement(button);

      navigator.xr
        .isSessionSupported('immersive-ar')
        .then(function (supported) {
          supported ? showStartAR() : showARNotSupported();
        })
        .catch(showARNotAllowed);

      return button;
    }
    const message = document.createElement('a');

    if (window.isSecureContext === false) {
      message.href = document.location.href.replace(/^http:/, 'https:');
      message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message
    } else {
      message.href = 'https://immersiveweb.dev/';
      message.innerHTML = 'WEBXR NOT AVAILABLE';
    }

    message.style.left = 'calc(50% - 90px)';
    message.style.width = '180px';
    message.style.textDecoration = 'none';

    stylizeElement(message);

    return message;
  }
}
