import { FederatedEvent } from './FederatedEvent';

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
 * @link https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 *
 * @example
  const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
  circle.addEventListener('build', (e) => {
    e.target; // circle
    e.detail; // { prop1: 'xx' }
  });

  circle.dispatchEvent(event);
 */
export class CustomEvent<
  O extends { detail?: any; [key: string | number]: any } = any,
> extends FederatedEvent<Event, O['detail']> {
  constructor(eventName: string, options?: O) {
    super(null);

    this.type = eventName;
    this.detail = options?.detail;

    // compatible with G 3.0
    Object.assign(this, options);
  }
}
