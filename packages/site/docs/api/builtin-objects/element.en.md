---
title: Element
order: 3
---

The following inheritance relationships exist in G.

-   DisplayObject -> Element -> Node -> EventTarget

# Inherited from

[Node](/en/docs/api/builtin-objects/node)

# Properties

## id

Unique in the scenario map, which can be subsequently queried by `getElementById`.

```js
const circle = new Circle({
    id: 'my-id',
    style: { r: 10 },
});

circle.id; // 'my-id';
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/id

## name

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/name

## className

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/className

## classList

Read-only property that returns a list of class names.

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/classList

```js
circle.className = 'c1 c2';
circle.classList; // ['c1', 'c2']
```

## attributes

Read-only, returns style attributes, e.g.

```js
const circle = new Circle({ style: { r: 10 } });

circle.attributes.r; // 10;
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/attributes

## children

Returns a list of child elements, equivalent to Node.childNodes.

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/children

## childElementCount

Return the length of the list of child elements.

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/childElementCount

## firstElementChild

Equals [Node.firstChild](/en/docs/api/builtin-objects/node#firstchild).

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/firstElementChild

## lastElementChild

Equals [Node.lastChild](/en/docs/api/builtin-objects/node#lastchild).

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/lastElementChild

## clientTop / clientLeft

Since border is not supported at the moment, it always returns 0.

https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop

# Methods

## getAttributeNames

https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames

## getAttribute

https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute

## removeAttribute

https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute

## setAttribute

https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute

## hasAttribute

https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute

## getBoundingClientRect

Returns the enclosing box in the browser coordinate system, regardless of child elements.

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect

## getClientRects

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getClientRects

## computedStyleMap

Get the parsed style Map of [style system](/en/docs/api/css/intro), e.g.

```js
const circle = new Circle({
  style: {
    r: 100,
    fill: '#f00',
  },
});

/**
 * user-defined values
 */
expect(circle.getAttribute('r')).to.be.eqls(100);
expect(circle.getAttribute('fill')).to.be.eqls('#f00');

/**
 * computed values
 */
const styleMap = circle.computedStyleMap();
expect((styleMap.get('r') as CSSUnitValue).equals(CSS.px(100))).to.be.true;
const fill = styleMap.get('fill') as CSSRGB;
expect(fill.r).to.be.eqls(255);
expect(fill.g).to.be.eqls(0);
expect(fill.b).to.be.eqls(0);
expect(fill.alpha).to.be.eqls(1);
```

https://developer.mozilla.org/en-US/docs/Web/API/Element/computedStyleMap

## destroy

Destroying itself will remove all event listeners and stop the ongoing animation.

## Node Query

### matches

Whether or not to match the selector string

https://developer.mozilla.org/en-US/docs/Web/API/Element/matches

### getElementById

### getElementsByName

### getElementsByClassName

### getElementsByTagName

### querySelector

### querySelectorAll

### find

### findAll

## Node Operations

Based on Node's existing node manipulation capabilities, it provides some more convenient operations, such as bulk adding sibling nodes, replacing all child nodes, etc.

### append(...nodes: this[])

Add a group of nodes in bulk at the end of the child node list of the current node.

```js
parent.appendChild(child1);
parent.appendChild(child2); // parent -> [child1, child2]
parent.append(child3, child34); // parent -> [child1, child2, child3, child4]
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/append

### prepend(...nodes: this[])

Add a group of nodes in bulk to the head of the current node's child node list.

```js
parent.appendChild(child1);
parent.appendChild(child2); // parent -> [child1, child2]
parent.prepend(child3, child34); // parent -> [child3, child4, child1, child2]
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/prepend

### after(...nodes: Element[])

Add some sibling nodes in bulk after the current node, e.g. add a batch at once.

```js
circle.after(sibling1, sibling2); // [circle, sibling1, sibling2]
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/after

### before(...nodes: Element[])

Add some sibling nodes in bulk before the current node, e.g. add a batch at once.

```js
circle.before(sibling1, sibling2); // [sibling1, sibling2, circle]
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/before

### remove(destroy = true)

Remove itself from the scene graph, you can choose whether to destroy it at the same time, the default will be destroyed.

```js
circle.remove();
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/remove

### removeChildren()

Remove and destroy all child nodes from the scene graph.

```js
parent.removeChildren();
```

### replaceWith(...nodes: Element[])

In the list of children of the parent node, replace the node with the list of nodes passed in.

```js
parent.appendChild(child1);
parent.appendChild(child2); // parent -> [child1, child2]
child1.replaceWith(node1, node2); // parent -> [node1, node2, child2]
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceWith

### replaceChildren(...nodes: Element[])

Replace all children of the node. If no parameters are passed, all children of the node are cleared and destroyed.

```js
parent.replaceChildren(child1, child2);
parent.replaceChildren(); // 清空
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/replaceChildren

## Animation

### getAnimations

Returns a list of animation objects applied to the current element, see [animation system](/en/docs/api/animation)

https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations

### animate

Apply Keyframe animation, see [animation system](/en/docs/api/animation)

https://developer.mozilla.org/zh-CN/docs/Web/API/Element/animate
