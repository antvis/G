---
title: Group 图形分组
order: 1
---

虽然我们支持在所有基础图形上添加子节点表达层次关系，但有时还是需要一种类似“容器”的概念，它本身并无实体，只容纳其他子元素。例如典型的太阳系例子中，太阳轨道、地球轨道就使用了 Group 来创建。

虽然 Group 没有绘图属性，但 [DisplayObject](/zh/api/basic/display-object) 的通用能力它都具有。例如查询子节点、变换、获取包围盒等。

```js
group.appendChild(circle);
group.getBounds(); // circle's bounds

// transform
group.translate(100, 0);

// query
group.getElementsByTagName('circle'); // [circle]
```

## 继承自

-   [DisplayObject](/zh/api/basic/display-object)
