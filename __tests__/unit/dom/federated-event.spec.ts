import chai, { expect } from 'chai';
import {
  FederatedEvent,
  FederatedMouseEvent,
  FederatedPointerEvent,
} from '@antv/g';
import chaiAlmost from 'chai-almost';
import sinonChai from 'sinon-chai';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('FederatedEvent', () => {
  it('should init FederatedEvent correctly.', () => {
    const event = new FederatedEvent(null);

    expect(event.name).to.be.undefined;
    expect(event.type).to.be.undefined;
    // expect(event.eventPhase).to.be.eqls(0);
    expect(event.target).to.be.undefined;
    expect(event.bubbles).to.be.true;
    expect(event.cancelBubble).to.be.true;
    expect(event.cancelable).to.be.false;
    expect(event.currentTarget).to.be.undefined;
    expect(event.defaultPrevented).to.be.false;
    expect(event.layerX).to.be.eqls(0);
    expect(event.layerY).to.be.eqls(0);
    expect(event.pageX).to.be.eqls(0);
    expect(event.pageY).to.be.eqls(0);
    expect(event.x).to.be.eqls(0);
    expect(event.y).to.be.eqls(0);
    expect(event.canvasX).to.be.eqls(0);
    expect(event.canvasY).to.be.eqls(0);
    expect(event.viewportX).to.be.eqls(0);
    expect(event.viewportY).to.be.eqls(0);
    expect(event.composedPath()).to.be.undefined;
    expect(event.propagationPath).to.be.undefined;

    event.preventDefault();
    expect(event.defaultPrevented).to.be.true;

    event.stopImmediatePropagation();
    expect(event.propagationImmediatelyStopped).to.be.true;

    event.stopPropagation();
    expect(event.propagationStopped).to.be.true;

    // deprecated
    event.initEvent();
    event.initUIEvent();

    expect(event.which).to.be.undefined;
    expect(event.returnValue).to.be.undefined;
    expect(event.srcElement).to.be.undefined;
    expect(event.isTrusted).to.be.undefined;
    expect(event.composed).to.be.false;
  });

  it('should init FederatedMouseEvent correctly.', () => {
    const event = new FederatedMouseEvent(null);

    expect(event.clientX).to.be.eqls(0);
    expect(event.clientY).to.be.eqls(0);
    expect(event.movementX).to.be.eqls(0);
    expect(event.movementY).to.be.eqls(0);
    expect(event.offsetX).to.be.eqls(0);
    expect(event.offsetY).to.be.eqls(0);
    expect(event.globalX).to.be.eqls(0);
    expect(event.globalY).to.be.eqls(0);
    expect(event.screenX).to.be.eqls(0);
    expect(event.screenY).to.be.eqls(0);

    expect(() => event.initMouseEvent()).to.throw();
    expect(() => event.getModifierState('')).to.throw();
  });

  it('should init FederatedPointerEvent correctly.', () => {
    const event = new FederatedPointerEvent(null);
    expect(event.getCoalescedEvents()).to.eqls([]);

    event.type = 'pointermove';
    expect(event.getCoalescedEvents()).to.eqls([event]);

    event.type = 'mousemove';
    expect(event.getCoalescedEvents()).to.eqls([event]);

    event.type = 'touchmove';
    expect(event.getCoalescedEvents()).to.eqls([event]);

    expect(() => event.getPredictedEvents()).to.throw();
  });
});
