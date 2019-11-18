---
title: API
---

## 属性

- 通用的 [绘图属性](/zh/docs/api/shape/attribute)
- `x`: 文字的位置坐标 x
- `y`: 文字的位置坐标 y
- `font`: 设置文本内容的当前字体属性，这个属性可以分解成多个属性单独配置：
  - `fontStyle`: 设置字体样式；
  - `fontVariant`: 设置小型大写字母的字体显示文本；
  - `fontWeight`: 设置字体粗细；
  - `fontSize`: 设置字体的尺寸；
  - `fontFamily`: 设置字体类型；
  - `textAlign`: 设置文本内容的对齐方式, 支持的属性值有：`center|end|left|right|start`；
  - `textBaseline`: 设置在绘制文本时使用的当前文本基线, 支持的属性值有：`top|middle|bottom`；
