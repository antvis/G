---
title: Document
order: 4
---

在 G 中有以下继承关系：

-   Document -> Node -> EventTarget

# 属性

## nodeName

实现了 [Node.nodeName](/zh/docs/api/builtin-objects/node#nodename)，返回 `'document'`，在事件处理器中可用来快速判断 target，例如点击了画布的空白区域时：

```js
canvas.addEventListener('click', (e) => {
    e.target; // Document

    if (e.target.nodeName === 'document') {
        //...
    }
});
```

## defaultView

指向画布，例如：

```js
canvas.document.defaultView; // canvas
```

https://developer.mozilla.org/en-US/docs/Web/API/Document/defaultView

## documentElement

返回场景图中的根节点，在创建画布时会默认使用 [Group](/zh/docs/api/basic/group) 创建一个：

```js
canvas.document.documentElement; // Group
canvas.document.documentElement.getBounds(); // 获取整个场景的包围盒
```

https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement

## timeline

默认时间轴，在动画系统中使用。

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/timeline

## ownerDocument

返回 null

# 方法

由于继承自 [Node](/zh/docs/api/builtin-objects/node)，因此显然拥有了事件绑定能力：

```js
canvas.document.addEventListener('click', () => {});
```

但在一些方法特别是节点操作上和 Node 有差异。

## 节点操作

虽然继承了 [Node](/zh/docs/api/builtin-objects/node)，但在 Document 上无法调用一些节点操作方法，正如在浏览器中调用 `document.appendChild` 会返回如下错误一样：

```
Uncaught DOMException: Failed to execute 'appendChild' on 'Node': Only one element on document allowed.
```

## 节点查询

以下节点查询方法等同于在 document.documentElement 上执行。

### getElementById

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementById

### getElementsByName

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByName

### getElementsByClassName

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByClassName

### getElementsByTagName

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/getElementsByTagName

### querySelector

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelector

### querySelectorAll

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelectorAll
