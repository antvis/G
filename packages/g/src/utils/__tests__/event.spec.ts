import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { normalizeToPointerEvent } from '../event';

chai.use(chaiAlmost());
chai.use(sinonChai);

describe('Event utils', () => {
  it('should normalizeToPointerEvent correctly', () => {
    let events = normalizeToPointerEvent(
      new PointerEvent('pointerdown', { clientX: 100, clientY: 100 }),
    );
    expect(events.length).to.be.eqls(1);

    events = normalizeToPointerEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
    expect(events.length).to.be.eqls(1);

    const touchObj = new Touch({
      identifier: Date.now(),
      target: document.createElement('div'),
      clientX: 100,
      clientY: 100,
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 10,
      force: 0.5,
    });
    events = normalizeToPointerEvent(
      new TouchEvent('touchstart', {
        changedTouches: [touchObj],
      }),
    );
    expect(events.length).to.be.eqls(1);
    // const normalized = events[0];
    // expect(normalized.button).to.be.eqls(1);
    // expect(normalized.buttons).to.be.eqls(1);
  });
});
