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

## cloneNode

方法签名为 `cloneNode(deep?: boolean): this`，可选参数为是否需要深拷贝，返回克隆得到的新节点。

在下面的例子中，我们创建了一个圆，设置了它的半径与位置。拷贝得到的新节点拥有同样的样式属性与位置：

```js
circle.style.r = 20;
circle.setPosition(10, 20);

const clonedCircle = circle.cloneNode();
clonedCircle instanceof Circle; // true
clonedCircle.style.r; // 20
clonedCircle.getPosition(); // [10, 20]
```

注意事项：

-   支持深拷贝，即自身以及整棵子树
-   克隆的新节点不会保留原始节点的父子关系，需要使用 `appendChild` 将其加入画布才会被渲染
-   与 [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes) 保持一致，不会拷贝原图形上的事件监听器

在这个[示例](/zh/examples/scenegraph#clone)中，我们展示了以上特性：

-   可以随时更改原始节点的样式属性，得到的拷贝都会是最新的，新节点同样需要被加入到场景图中才会被渲染
-   但由于不会拷贝事件监听器，因此只有原始节点可以进行拖拽
-   非深拷贝模式下，Text（Drag me 文本） 作为 Circle 的子节点不会被拷贝

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PwEYSI_ijPEAAAAAAAAAAAAAARQnAQ)

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
