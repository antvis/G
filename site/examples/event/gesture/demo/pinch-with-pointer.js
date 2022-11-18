import { Canvas, CanvasEvent, Circle, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

/**
 * Implements Pinch zoom gestures with PointerEvent
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 300,
  height: 300,
  renderer: canvasRenderer,
});

// add a circle to canvas
const circle = new Circle({
  style: {
    cx: 200,
    cy: 200,
    r: 200,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});
const text = new Text({
  style: {
    x: -150,
    y: -100,
    fill: 'black',
    text: 'Pinch',
    wordWrap: true,
    wordWrapWidth: 160,
    pointerEvents: 'none',
  },
});
circle.appendChild(text);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);

  // Global vars to cache event state
  var evCache = new Array();
  var prevDiff = -1;

  function log(prefix, ev) {
    text.style.text =
      prefix +
      ': pointerID = ' +
      ev.pointerId +
      ' ; pointerType = ' +
      ev.pointerType +
      ' ; isPrimary = ' +
      ev.isPrimary;
  }

  function pointerdown_handler(ev) {
    // The pointerdown event signals the start of a touch interaction.
    // This event is cached to support 2-finger gestures
    evCache.push({
      pointerId: ev.pointerId,
      clientX: ev.clientX,
      clientY: ev.clientY,
    });

    log('pointerDown', ev);
  }

  function pointermove_handler(ev) {
    // This function implements a 2-pointer horizontal pinch/zoom gesture.
    //
    // If the distance between the two pointers has increased (zoom in),
    // the taget element's background is changed to "pink" and if the
    // distance is decreasing (zoom out), the color is changed to "lightblue".
    //
    // This function sets the target element's border to "dashed" to visually
    // indicate the pointer's target received a move event.
    log('pointerMove', ev);
    // ev.target.style.border = 'dashed';

    // Find this event in the cache and update its record with this event
    for (var i = 0; i < evCache.length; i++) {
      if (ev.pointerId == evCache[i].pointerId) {
        evCache[i] = {
          pointerId: ev.pointerId,
          clientX: ev.clientX,
          clientY: ev.clientY,
        };
        break;
      }
    }

    // If two pointers are down, check for pinch gestures
    if (evCache.length == 2) {
      // Calculate the distance between the two pointers
      var curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

      if (prevDiff > 0) {
        if (curDiff > prevDiff) {
          // The distance between the two pointers has increased
          log('Pinch moving OUT -> Zoom in', ev);
          ev.target.style.fill = 'pink';
        }
        if (curDiff < prevDiff) {
          // The distance between the two pointers has decreased
          log('Pinch moving IN -> Zoom out', ev);
          ev.target.style.fill = 'lightblue';
        }
      }

      // Cache the distance for the next move event
      prevDiff = curDiff;
    }
  }

  function pointerup_handler(ev) {
    log(ev.type, ev);
    // Remove this pointer from the cache and reset the target's
    // background and border
    remove_event(ev);
    ev.target.style.fill = '#1890FF';

    // If the number of pointers down is less than two then reset diff tracker
    if (evCache.length < 2) prevDiff = -1;
  }

  function remove_event(ev) {
    // Remove this event from the target's cache
    for (var i = 0; i < evCache.length; i++) {
      if (evCache[i].pointerId == ev.pointerId) {
        evCache.splice(i, 1);
        break;
      }
    }
  }

  circle.addEventListener('pointerdown', pointerdown_handler);
  circle.addEventListener('pointermove', pointermove_handler);
  circle.addEventListener('pointerup', pointerup_handler);
  circle.addEventListener('pointecancel', pointerup_handler);
  circle.addEventListener('pointerout', pointerup_handler);
  circle.addEventListener('pointerleave', pointerup_handler);
});
