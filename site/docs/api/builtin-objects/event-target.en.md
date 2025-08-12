---
title: EventTarget
order: 1
---

Similar to [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) in the DOM API, this object provides the ability to bind/unbind events.

The following inheritance relationships exist in G, so the high-level objects [Canvas](/api/canvas/intro), [Document](/api/builtin-objects/document), [DisplayObject](/api/basic/display-object) all have event management capabilities.

- Canvas -> EventTarget
- Document -> Node -> EventTarget
- DisplayObject -> Element -> Node -> EventTarget

Specific API can be found in [event system](/api/event/intro).

- Bind event: [addEventListener](/api/event/intro#addeventlistener)
- Unbind event: [removeEventListener](/api/event/intro#removeeventlistener)
- Trigger custom events: [dispatchEvent](/api/event/intro#dispatchevent)
- Remove all event listeners [removeAllEventListeners](/api/event/intro#removealleventlisteners)
