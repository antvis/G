---
title: 路线图
order: 10
---

# 核心系统

`g-core` 中各个核心系统实现，每一帧按优先级顺序执行。

| 名称       | 进度 | 备注                                                              |
| ---------- | ---- | ----------------------------------------------------------------- |
| Timeline   | ✅   | 动画系统，通过 `shape.animate()` 触发对 `Shape` 属性的插值更新    |
| AABB       | ✅   | 包围盒计算系统，计算当前最小重绘区域（脏矩形）                    |
| SceneGraph | ✅   | 场景图系统，维护 `Shape/Group` 间层次关系，同时处理变换           |
| Culling    | ✅   | 剔除系统，供上层自定义剔除策略，例如 `g-webgl` 中基于视锥剔除策略 |
| Renderer   | ✅   | 渲染系统，供上层自定义渲染服务实现                                |
| Event      |      | 事件系统，通过对图形的拾取完成事件冒泡                            |

# 基础图形迁移/实现

| 图形     | g-canvas | g-svg | g-webgl |
| -------- | -------- | ----- | ------- |
| Circle   | ✅       |       | ✅      |
| Ellipse  | ✅       |       | ✅      |
| Image    | ✅       |       | ✅      |
| Rect     |          |       |         |
| Text     |          |       |         |
| Line     |          |       |         |
| Path     |          |       |         |
| Polygon  |          |       |         |
| Polyline |          |       |         |
| Marker   |          |       |         |

# 新增特性

## Canvas

### 脏矩形渲染

默认开启：

```javascript
{
  dirtyRectangle: {
    enable: true,
    debug: true,
  }
}
```

可以在运行时关闭：

```javascript
canvas.setRenderer({
    dirtyRectangle: {
        enable: false,
    },
});
```

## Group

### Transform

提供在 2D _世界坐标系_ 和 _局部坐标系_ 下的变换能力。

| 名称             | 进度 | 备注                                                   |
| ---------------- | ---- | ------------------------------------------------------ |
| setPosition      | ✅   | 设置 _世界坐标系_ 下的位置，兼容老版本的 `moveTo/move` |
| setLocalPosition | ✅   | 设置 _局部坐标系_ 下的位置                             |
| translate        | ✅   | 在 _世界坐标系_ 下，相对当前位置移动                   |
| translateLocal   | ✅   | 在 _局部坐标系_ 下，相对当前位置移动                   |
| getPosition      | ✅   | 获取 _世界坐标系_ 下的位置                             |
| getLocalPosition | ✅   | 获取 _局部坐标系_ 下的位置                             |
| setLocalScale    | ✅   | 设置 _局部坐标系_ 下的缩放                             |
| scale            | ✅   | 在 _局部坐标系_ 下，相对当前缩放等级进行缩放           |
| getScale         | ✅   | 获取 _世界坐标系_ 下的缩放                             |
| getLocalScale    | ✅   | 获取 _局部坐标系_ 下的缩放                             |
| rotate           | ✅   | 绕原点进行旋转，参数为 `radian`                        |
| rotateAtStart    | ✅   | 绕自身位置进行旋转                                     |
| rotateAtPoint    | ✅   | 绕任意点进行旋转                                       |

⚠️ 我们无法直接设置世界坐标系下的缩放，因此不存在 `setScale` 这样的方法。

⚠️ 我们仍提供了 `get/setMatrix()`，但应当尽量避免直接使用它们。

### Z-index

提供 `Group` 内的渲染次序设置，渲染前依此排序。

| 名称      | 进度 | 备注                    |
| --------- | ---- | ----------------------- |
| setZIndex | ✅   | 直接设置 `z-index`      |
| toFront   | ✅   | 置于当前 `Group` 内顶层 |
| toBack    | ✅   | 置于当前 `Group` 内底层 |

### 可见性

提供 `Group` 的可见性。

| 名称 | 进度 | 备注                              |
| ---- | ---- | --------------------------------- |
| show | ✅   | 展示，对 `Group` 内所有子元素生效 |
| hide | ✅   | 隐藏，对 `Group` 内所有子元素生效 |

## Shape

`Shape` 继承 `Group`。

## 性能相关

### 脏矩形渲染

⚠️ 仅 `g-canvas/g-webgl` 生效

使用 R-tree 加速，[详见](/zh/docs/guide/advanced-topics)

### Instancing 绘制

⚠️ 仅 `g-webgl` 生效

通过批量绘制，大幅提升同类图形绘制性能，动画场景下 `g-canvas` 10FPS 提升到 `g-webgl` 40 FPS。参考 [例子](/zh/examples/perf/instance#webgl-instancing)

### Offscreen Canvas

⚠️ 仅 `g-webgl` 生效

[详见](/zh/docs/guide/advanced-topics)

# 测试用例

| 名称     | 进度 | 备注              |
| -------- | ---- | ----------------- |
| g-ecs    | ✅   | 底层 ECS 架构实现 |
| g-core   |      |                   |
| g-canvas |      |                   |
| g-svg    |      |                   |
| g-webgl  |      |                   |

# 官网

| 名称              | 进度 | 备注                           |
| ----------------- | ---- | ------------------------------ |
| 使用文档          |      |                                |
| - Getting Started |      | 可以分章节，实现一个完整的例子 |
| - Diving Deeper   |      | 基础图形、动画、事件           |
| - Advanced Topics |      | 性能优化                       |
| API               |      |                                |
| 示例              |      |                                |

# Bug List

https://yuque.antfin.com/shiwu.wyy/go1ec6/lev4l4
