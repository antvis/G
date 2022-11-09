---
title: MutationObserver
order: 5
---

在 DOM API 中，当我们想感知 DOM 树节点的修改，例如新节点加入、属性值变更，可以使用 [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)。

在 G 中我们同样实现了这个 API，用来监听场景图中的变化。

## 构造函数

创建一个 MutationObserver 需要传入一个 callback：

```js
const group1 = new Group();
const group2 = new Group();
const group3 = new Group();
canvas.appendChild(group1);

// 创建一个 MutationObserver
const observer = new MutationObserver(() => {});

// 开始监听
observer.observe(group1, { childList: true });

// 操作场景图
group1.appendChild(group2);
group1.appendChild(group3);

// 获取变更记录
const records = observer.takeRecords();

// 断开监听
observer.disconnect();
```

## observe

监听场景图中一个节点的变化，可以通过配置选择监听单个节点或者全部子孙节点。

https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver/observe

```js
mutationObserver.observe(target[, options])
```

`options` 为可选项，类型为 [MutationObserverInit](https://developer.mozilla.org/zh-CN/docs/conflicting/Web/API/MutationObserver/observe_2f2addbfa1019c23a6255648d6526387) 配置如下：

-   `childList` 设为 true 以监视目标节点（如果 subtree 为 true，则包含子孙节点）添加或删除新的子节点。默认值为 false。
-   `subtree` 设为 true 以将监视范围扩展至目标节点整个节点树中的所有节点。MutationObserverInit 的其他值也会作用于此子树下的所有节点，而不仅仅只作用于目标节点。默认值为 false。
-   `attributes` 设为 true 以观察受监视元素的属性值变更。默认值为 false。
-   `attributeOldValue` 当监视节点的属性改动时，将此属性设为 true 将记录任何有改动的属性的上一个值。
-   `attributeFilter` 要监视的特定属性名称的数组。如果未包含此属性，则对所有属性的更改都会触发变动通知。无默认值。

## disconnect

断开监听。

https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver/disconnect

## takeRecords

获取变更记录。

https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver/takeRecords

在下面的例子中，我们监听父节点的变化，当加入两个子节点后获取到两条变更记录：

```js
const group1 = new Group();
const group2 = new Group();
const group3 = new Group();
canvas.appendChild(group1);

// 创建一个 MutationObserver
const observer = new MutationObserver(() => {});

// 开始监听 group1 上的变更
observer.observe(group1, { childList: true });

// 操作场景图
group1.appendChild(group2);
group1.appendChild(group3);

// 获取变更记录
const records = observer.takeRecords();
// 包含两条记录
expect(records.length).to.eqls(2);
expect(records[0].type).to.eqls('childList');
expect(records[0].target).to.eqls(group1);
expect(records[0].addedNodes.length).to.eqls(1);
expect(records[0].addedNodes[0]).to.eqls(group2);

expect(records[1].type).to.eqls('childList');
expect(records[1].target).to.eqls(group1);
expect(records[1].addedNodes.length).to.eqls(1);
expect(records[1].addedNodes[0]).to.eqls(group3);
expect(records[1].previousSibling).to.eqls(group2);
```
