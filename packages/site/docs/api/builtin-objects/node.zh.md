---
title: Node
order: 2
---

和 DOM API 中的 [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node) 类似，该对象提供了一部分场景图能力，例如节点添加、删除等。

在 G 中有以下继承关系：

-   Document -> Node -> EventTarget
-   DisplayObject -> Element -> Node -> EventTarget

# 继承自

[EventTarget](/zh/docs/api/builtin-objects/event-target)

# 属性

## nodeName

返回节点名称，例如：

```js
circle.nodeName; // 'circle'
rect.nodeName; // 'rect'
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeName

## isConnected

是否被加入到画布中，例如：

```js
circle.isConnected; // false
canvas.appendChild(circle); // 加入到画布中
circle.isConnected; // true
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected

## ownerDocument

指向画布的入口 [Document](/zh/docs/api/builtin-objects/document)。如果还未加入到画布中，返回 null，例如：

```js
circle.ownerDocument; // null
canvas.appendChild(circle); // 加入到画布中
circle.ownerDocument; // canvas.document
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/ownerDocument

## parentNode

返回当前节点的父节点。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/parentNode

## parentElement

在目前的实现中同 parentNode。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/parentElement

## childNodes

返回当前节点的子节点列表。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/childNodes

## firstChild

返回当前节点的第一个子节点，如果无子节点，则返回 null。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/firstChild

## lastChild

返回当前节点的最后一个子节点，如果无子节点，则返回 null。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/lastChild

## nextSibling

返回当前节点的后一个兄弟节点，没有则返回 null。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nextSibling

## previousSibling

返回当前节点的前一个兄弟节点，没有则返回 null。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/previousSibling

# 方法

## appendChild

将一个节点添加到指定父节点的子节点列表末尾处。如果该节点已经在场景图中，会先从原位置处移除，再添加到新的位置。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild

## [WIP] cloneNode

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/cloneNode

## contains

判断传入的节点是否为该节点的后代节点。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/contains

## getRootNode

返回当前节点的根节点。如果已经被添加到画布中，会返回 canvas.document 例如：

```js
circle.getRootNode(); // circle
canvas.appendChild(circle);
circle.getRootNode(); // canvas.document
```

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/getRootNode

## getAncestor

返回指定层次的祖先节点，例如：

```js
circle.getAncestor(2); // circle.parentNode.parentNode
```

如果向上查找超出了根节点，则返回 null：

```js
circle.getAncestor(100); // null
```

## hasChildNodes

是否有子节点。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/hasChildNodes

## insertBefore

完整方法签名为：

```
insertBefore(child: Node, reference?: Node): Node
```

在参考节点之前插入一个拥有指定父节点的子节点。如果给定的子节点是对文档中现有节点的引用，insertBefore() 会将其从当前位置移动到新位置（在将节点附加到其他节点之前，不需要从其父节点删除该节点）。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore

## removeChild

完整方法签名为：

```
removeChild(child: Node, destroy?: boolean): Node
```

删除一个子节点，同时可以选择是否要销毁这个子节点，最后返回被删除的子节点。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild

## replaceChild

用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild

## isEqualNode

判断两个节点是否相等。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isEqualNode
