---
title: Group
order: 1
---

While we support adding child nodes to all base graphs to express hierarchical relationships, sometimes there is a need for a "container" like concept that has no entity of its own and only holds other child elements. For example, in the typical solar system example, the solar orbit and the Earth's orbit are created using a Group.

Although Group does not have drawing properties, it has all the general capabilities of [DisplayObject](/en/api/basic/display-object). For example, querying child nodes, transformations, getting bounding boxes, etc.

```js
group.appendChild(circle);
group.getBounds(); // circle's bounds

// transform
group.translate(100, 0);

// query
group.getElementsByTagName('circle'); // [circle]
```

## Inherited from

-   [DisplayObject](/en/api/basic/display-object)
