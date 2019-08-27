export function simulateMouseEvent(dom, type, cfg) {
  const event = new MouseEvent(type, cfg);
  dom.dispatchEvent(event);

  // var event = document.createEvent('Event');

  // // Create a click event that bubbles up and
  // // cannot be canceled
  // event.initEvent(type, true, false);
  // Object.assign(event, cfg);
  // dom.dispatchEvent(event);
}
