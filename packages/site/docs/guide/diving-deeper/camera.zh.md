---
title: 使用相机
order: 2
---

相机（Camera）描述了我们观察世界的角度。视点、相机位置都会影响最终的成像。在创建 Canvas 画布时，已经内置了一个默认使用正交投影的相机。

其中会涉及以下 API：

-   使用 [appendChild](/zh/docs/api/basic/display-object#添加删除节点) 创建场景中各个节点的父子关系
-   使用 [translate](/zh/docs/api/basic/display-object#平移) 移动节点
-   使用 [rotate](/zh/docs/api/basic/display-object#旋转) 让节点旋转
-   使用 [getElementsByName](/zh/docs/api/basic/display-object#简单节点查询) 在场景图中查询节点
-   使用 [addEventListener](/zh/docs/api/event#addeventlistener) 监听画布事件

最终示例：

-   [官网示例](/zh/examples/scenegraph#hierarchy)
-   [CodeSandbox 示例](https://codesandbox.io/s/jiao-cheng-tai-yang-xi-li-zi-1bphz)
