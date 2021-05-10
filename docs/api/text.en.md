---
title: Text 文本
order: 1
---

提供简单的单行/多行文本排版能力，单行支持水平对齐、字符间距；多行支持显式换行符以及自动换行，垂直对齐。

可以在该 [示例](/zh/examples/shape#text) 中调整以下属性。

# 继承自

- [DisplayObject](/zh/docs/api/display-object)

文本/文本块的位置通过文本锚点描述，围绕该锚点通过 `textBaseline`（单行/多行）、`textAlign`（多行）等属性调整自身位置。

# 额外属性

## text

**类型**： `String`

**默认值**：无

**是否必须**：`true`

**说明**：文本内容，可以包含换行符，例如 `"测试文本\n另起一行"`

## 字体相关

### fontFamily

**类型**： `String`

**默认值**：无

**是否必须**：`true`

**说明**：字体类型，例如 `'PingFang SC'` `'Microsoft Yahei'`

### fontSize

**类型**： `number`

**默认值**：无

**是否必须**：`true`

**说明**：字体大小

### fontWeight

**类型**： `String` | `number`

**默认值**：`normal`

**是否必须**：`false`

**说明**：字体粗细

### fontStyle

**类型**： `String`

**默认值**：`normal`

**是否必须**：`false`

**说明**：字体样式，例如下图为倾斜 `italic` 效果

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ)

### fontVariant

**类型**： `String`

**默认值**：`normal`

**是否必须**：`false`

**说明**：字体样式，例如下图为 `small-cap` 效果

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*DQivSL2Oll0AAAAAAAAAAAAAARQnAQ)

## 单行布局

### textBaseline

类型： String

默认值：alphabetic

是否必须：false

说明：在垂直方向的对齐通过 `textBaseline` 实现，下图展示了不同取值下的对齐效果：
![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1g1SQZlEBCAAAAAAAAAAAAAAARQnAQ)

以文本当前位置为锚点，下图依次展示了 `top` `middle` 和 `bottom` 的效果。除了单行也适用于多行文本块：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZJzIQKBhAnUAAAAAAAAAAAAAARQnAQ)

### letterSpacing

类型： number

默认值：0

是否必须：false

说明：字符间距

## 多行布局

在以下两种情况下会出现换行：

1. 文本中的换行符
2. 开启 `wordWrap` 后，超出 `wordWrapWidth` 的部分自动换行，类似 CSS 中的 `word-break`

因此在解析原始文本时，需要考虑这两种情况。但在处理 CJK(Chinese/Japanese/Korean) 字符时，需要考虑它们的特殊语言规范。事实上 CSS 的 `word-break` 也提供了考虑 CJK 情况的值。

### textAlign

类型： String

默认值：left

是否必须：false

说明：在多行文本中，每一行可以在水平方向以锚点（anchor）对齐

下图依次展示了 `left` `center` 和 `right` 的效果：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*tyAzR7Y11oIAAAAAAAAAAAAAARQnAQ)

### wordWrap

类型： boolean

默认值：false

是否必须：false

说明：是否开启自动折行

### wordWrapWidth

类型： number

默认值：无

是否必须：false

说明：开启自动折行后，超出该宽度则换行

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FdtgQLndl8IAAAAAAAAAAAAAARQnAQ)

### lineHeight

类型： number

默认值：无

是否必须：false

说明：行高

### leading

类型： number

默认值：无

是否必须：false

说明：行间距

## [WIP] 阴影
