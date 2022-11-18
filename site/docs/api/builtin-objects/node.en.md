---
title: Node
order: 2
---

Similar to [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node) in the DOM API, this object provides part of the scene graph capabilities, such as node addition, deletion, etc.

The following inheritance relationships exist in G.

-   Document -> Node -> EventTarget
-   DisplayObject -> Element -> Node -> EventTarget

## Inherited from

[EventTarget](/en/api/builtin-objects/event-target)

## Properties

### nodeName

Read-only, returns the node name, e.g.

```js
circle.nodeName; // 'circle'
rect.nodeName; // 'rect'
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeName

G The built-in graphic names are as follows.

```js
export enum Shape {
  GROUP = 'g',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
  IMAGE = 'image',
  RECT = 'rect',
  LINE = 'line',
  POLYLINE = 'polyline',
  POLYGON = 'polygon',
  TEXT = 'text',
  PATH = 'path',
  HTML = 'html',
  MESH = 'mesh'
}
```

### nodeValue

Read-only, return node string, default is null.[Text](/en/api/basic/text) will return text string.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeValue

```js
const group = new Group();
group.nodeValue; // null

const text = new Text({ style: { text: 'test' } });
text.nodeValue; // 'test'
```

### isConnected

Read-only, whether it is added to the canvas, e.g.

```js
circle.isConnected; // false
canvas.appendChild(circle); // 加入到画布中
circle.isConnected; // true
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected

### ownerDocument

Read-only, pointing to the entry [Document](/en/api/builtin-objects/document) of the canvas. Returns null if not yet added to the canvas, e.g.

```js
circle.ownerDocument; // null
canvas.appendChild(circle); // 加入到画布中
circle.ownerDocument; // canvas.document
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/ownerDocument

### parentNode

Read-only, returns the parent node of the current node.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/parentNode

### parentElement

Read-only, same as parentNode in the current implementation.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/parentElement

### childNodes

Read-only, returns the list of child nodes of the current node.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/childNodes

### firstChild

Read-only, returns the first child of the current node, or null if there are no children.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/firstChild

### lastChild

Read-only, returns the last child of the current node, or null if there are no children.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/lastChild

### nextSibling

Read-only, returns the next sibling of the current node, or null if none.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nextSibling

### previousSibling

Read-only, returns the previous sibling of the current node, or null if there is none.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/previousSibling

### textContent

Read/write property to get or set the text content of the node. The default returns the empty string, [Text](/en/api/basic/text) will return the text string.

When reading, this method recursively computes the sub-nodes and returns the final stitched string as.

```js
const group = new Group();
group.textContent; // ''

const text = new Text({ style: { text: 'test' } });
group.appendChild(text);

text.textContent; // 'test'
group.textContent; // 'test'
```

When setting, all children of this node will be removed first, if the node is [Text](/en/api/basic/text), the text content will be modified directly; if the node is not [Text](/en/api/basic/text), a [Text](/en/api/basic/text) will be created as a child node and the text content will be set.

```js
const text = new Text({ style: { text: 'test' } });
text.textContent = 'changed';

// create a Text & insertChild
group.textContent = 'changed';
group.childNodes; // [Text]
```

## Methods

### appendChild

Adds a node to the end of the child node list of the specified parent node. If the node is already in the scene graph, it will be removed from its original position and then added to the new position.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild

### cloneNode

The method signature is `cloneNode(deep?: boolean): this`, with optional arguments for whether a deep copy is needed, and returns the new node obtained by cloning.

In the following example, we create a circle, set its radius and position. The new node is copied with the same style properties and position.

```js
circle.style.r = 20;
circle.setPosition(10, 20);

const clonedCircle = circle.cloneNode();
clonedCircle instanceof Circle; // true
clonedCircle.style.r; // 20
clonedCircle.getPosition(); // [10, 20]
```

Caveats.

-   Deep copy support, i.e. itself and the whole subtree
-   Cloned new nodes do not retain the parent-child relationship of the original node, and need to be added to the canvas using `appendChild` before they will be rendered
-   Consistent with the [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes), event listeners on the original graph are not copied

In this [example](/en/examples/scenegraph#clone), we demonstrate the above features.

-   The style properties of the original node can be changed at any time, the copy will be up-to-date, and the new node will also need to be added to the scene graph before it will be rendered
-   However, since no event listeners are copied, only the original node can be dragged and dropped
-   In non-deep copy mode, Text (Drag me Text) is not copied as a child of Circle.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PwEYSI_ijPEAAAAAAAAAAAAAARQnAQ)

### contains

Determine if the incoming node is a descendant of this node.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/contains

### getRootNode

Returns the root node of the current node. If it has already been added to the canvas, it returns canvas.document For example

```js
circle.getRootNode(); // circle
canvas.appendChild(circle);
circle.getRootNode(); // canvas.document
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/getRootNode

### getAncestor

Returns the ancestor node at the specified level, e.g.

```js
circle.getAncestor(2); // circle.parentNode.parentNode
```

If the lookup goes beyond the root node, null is returned.

```js
circle.getAncestor(100); // null
```

### hasChildNodes

If or not there are child nodes.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/hasChildNodes

### insertBefore

The full method signature is:

```
insertBefore(child: Node, reference?: Node): Node
```

Inserts a child node with the specified parent node before the reference node. If the given child node is a reference to an existing node in the document, insertBefore() will move it from its current position to the new position (it is not necessary to remove the node from its parent before attaching it to another node).

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore

### removeChild

The full method signature is:

```
removeChild(child: Node, destroy?: boolean): Node
```

Deletes a child node, finally returns the deleted child node.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild

### replaceChild

Replaces a child node of the current node with the specified node, and returns the replaced node.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild

### isEqualNode

Determines if two nodes are equal.

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isEqualNode

### compareDocumentPosition

Compare the positions of the two nodes in the scene graph.

https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition

For example, comparing itself will return 0.

```js
const group1 = new Element();
expect(group1.compareDocumentPosition(group1)).to.eqls(0);
```

Comparison with another node with no common ancestor.

```js
const group1 = new Element();
const group2 = new Element();
expect(group1.compareDocumentPosition(group2)).to.eqls(
    Node.DOCUMENT_POSITION_DISCONNECTED |
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC |
        Node.DOCUMENT_POSITION_PRECEDING,
);
```

Parent-child nodes.

```js
group1.appendChild(group2);
expect(group1.compareDocumentPosition(group2)).to.eqls(
    Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING,
);
expect(group2.compareDocumentPosition(group1)).to.eqls(
    Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING,
);
```

Sibling Nodes.

```js
// 1 -> 2
// 1 -> 4
group1.appendChild(group2);
group1.appendChild(group4);
expect(group2.compareDocumentPosition(group4)).to.eqls(
    Node.DOCUMENT_POSITION_PRECEDING,
);
expect(group4.compareDocumentPosition(group2)).to.eqls(
    Node.DOCUMENT_POSITION_FOLLOWING,
);
```

The enumeration values are as follows.

```js
static DOCUMENT_POSITION_DISCONNECTED = 1;
static DOCUMENT_POSITION_PRECEDING = 2;
static DOCUMENT_POSITION_FOLLOWING = 4;
static DOCUMENT_POSITION_CONTAINS = 8;
static DOCUMENT_POSITION_CONTAINED_BY = 16;
static DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;
```
