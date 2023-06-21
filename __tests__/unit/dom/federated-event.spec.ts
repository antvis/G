import {
  FederatedEvent,
  FederatedMouseEvent,
  FederatedPointerEvent,
} from '../../../packages/g/src';

describe('FederatedEvent', () => {
  it('should init FederatedEvent correctly.', () => {
    const event = new FederatedEvent(null);

    expect(event.name).toBeUndefined();
    expect(event.type).toBeUndefined();
    // expect(event.eventPhase).toBe(0);
    expect(event.target).toBeUndefined();
    expect(event.bubbles).toBeTruthy();
    expect(event.cancelBubble).toBeTruthy();
    expect(event.cancelable).toBeFalsy();
    expect(event.currentTarget).toBeUndefined();
    expect(event.defaultPrevented).toBeFalsy();
    expect(event.layerX).toBe(0);
    expect(event.layerY).toBe(0);
    expect(event.pageX).toBe(0);
    expect(event.pageY).toBe(0);
    expect(event.x).toBe(0);
    expect(event.y).toBe(0);
    expect(event.canvasX).toBe(0);
    expect(event.canvasY).toBe(0);
    expect(event.viewportX).toBe(0);
    expect(event.viewportY).toBe(0);
    expect(event.composedPath()).toBeUndefined();
    expect(event.propagationPath).toBeUndefined();

    event.preventDefault();
    expect(event.defaultPrevented).toBeTruthy();

    event.stopImmediatePropagation();
    expect(event.propagationImmediatelyStopped).toBeTruthy();

    event.stopPropagation();
    expect(event.propagationStopped).toBeTruthy();

    // deprecated
    event.initEvent();
    event.initUIEvent();

    expect(event.which).toBeUndefined();
    expect(event.returnValue).toBeUndefined();
    expect(event.srcElement).toBeUndefined();
    expect(event.isTrusted).toBeUndefined();
    expect(event.composed).toBeFalsy();
  });

  it('should init FederatedMouseEvent correctly.', () => {
    const event = new FederatedMouseEvent(null);

    expect(event.clientX).toBe(0);
    expect(event.clientY).toBe(0);
    expect(event.movementX).toBe(0);
    expect(event.movementY).toBe(0);
    expect(event.offsetX).toBe(0);
    expect(event.offsetY).toBe(0);
    expect(event.globalX).toBe(0);
    expect(event.globalY).toBe(0);
    expect(event.screenX).toBe(0);
    expect(event.screenY).toBe(0);

    expect(() => event.initMouseEvent()).toThrow();
    expect(() => event.getModifierState('')).toThrow();
  });

  it('should init FederatedPointerEvent correctly.', () => {
    const event = new FederatedPointerEvent(null);
    expect(event.getCoalescedEvents()).toStrictEqual([]);

    event.type = 'pointermove';
    expect(event.getCoalescedEvents()).toStrictEqual([event]);

    event.type = 'mousemove';
    expect(event.getCoalescedEvents()).toStrictEqual([event]);

    event.type = 'touchmove';
    expect(event.getCoalescedEvents()).toStrictEqual([event]);

    expect(() => event.getPredictedEvents()).toThrow();
  });
});
