import { FederatedEvent } from './FederatedEvent';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 *
 * @example
  const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
  circle.addEventListener('build', (e) => {
    e.target; // circle
    e.detail; // { prop1: 'xx' }
  });

  circle.dispatchEvent(event);
 */
export class CustomEvent extends FederatedEvent {
  constructor(eventName: string, object?: object) {
    super(null);

    this.type = eventName;
    this.detail = object;

    // compatible with G 3.0
    Object.assign(this, object);
  }
}
