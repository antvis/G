---
title: Image 图片
order: 5
---

如下 [示例](/zh/examples/shape#image) 定义了一个图片，左上角顶点位置为 `(200, 100)`：

```javascript
const image = new Image({
  attrs: {
    x: 200,
    y: 100,
    width: 200,
    height: 200,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});
```

通常我们习惯以图片中心，此时可以通过锚点 [anchor](/zh/docs/api/display-object#anchor) 进行修改：

```javascript
const image = new Image({
  attrs: {
    // 省略其他属性
    anchor: [0.5, 0.5],
  },
});
```

# 继承自

- [DisplayObject](/zh/docs/api/display-object)

通过 `(x, y)` 定义的位置为左上角顶点，可以通过锚点位置 [anchor]() 改变。

# 额外属性

### img

**类型**： `string | Image`

**默认值**：无

**是否必须**：`true`

**说明**：图片来源，支持以下两种：

- 图片地址字符串，加载成功后展示
- 自行创建 [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) 对象

### width

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：图片宽度

### height

**类型**： `number`

**默认值**：无

**是否必须**：`false`

**说明**：图片高度
