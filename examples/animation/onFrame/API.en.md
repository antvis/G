---
title: API
---

## 属性

- `container.on(eventType: string, callback: (ev: GraphEvent) => void, once: boolean)`
  - `container`: canvas 或 group 对象
  - `eventType`: 形如 `name:type` 的格式，表明在父元素 `container` 上委托监听名称为 `name` 的子元素的事件，且事件类型为 `type`。
