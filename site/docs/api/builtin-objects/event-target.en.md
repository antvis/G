---
title: EventTarget
order: 1
---

Similar to [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) in the DOM API, this object provides the ability to bind/unbind events.

The following inheritance relationships exist in G, so the high-level objects [Canvas](/en/api/canvas/intro), [Document](/en/api/builtin-objects/document), [DisplayObject](/en/api/basic/display-object) all have event management capabilities.

- Canvas -> EventTarget
- Document -> Node -> EventTarget
- DisplayObject -> Element -> Node -> EventTarget

Specific API can be found in [event system](/en/api/event/intro).

- Bind event: [addEventListener](/en/api/event/intro#addeventlistener)
- Unbind event: [removeEventListener](/en/api/event/intro#removeeventlistener)
- Trigger custom events: [dispatchEvent](/en/api/event/intro#dispatchevent)
- Remove all event listeners [removeAllEventListeners](/en/api/event/intro#removealleventlisteners)
