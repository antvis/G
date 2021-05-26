---
title: DisplayObject
order: 0
redirect_from:
  - /en/docs/api
---

DisplayObject 是所有图形的基类，`Group` `Circle` `Text` 等都会继承它。

# id

可通过 [getElementById](/zh/docs/api/display-object#高级查询) 查询

# name

可通过 [getElementsByName](/zh/docs/api/display-object#高级查询) 查询

# className

可通过 [getElementsByClassName](/zh/docs/api/display-object#高级查询) 查询

# 绘图属性

绘图属性通过 `attrs` 设置，通常包含了图形的位置、填充色、透明度等**通用属性**，不同类型的图形也有自己的**额外属性**，例如在下面的圆角矩形中，位置`(x, y)`、填充色 `fill`、描边色 `stroke` 就是通用属性，而矩形的尺寸 `width/height` 和圆角半径 `radius` 则是额外属性：

```javascript
const rect = new Rect({
  attrs: {
    x: 200,
    y: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    width: 300,
    height: 200,
    radius: 8,
  },
});
```

## 位置

图形在局部坐标系下的初始位置通过 `(x, y)` 描述，后续也可以通过 [setLocalPosition](/zh/docs/api/display-object#平移) 重新设置。

对于不同的图形，“位置”的几何意义也不同，例如：

- [Circle](/zh/docs/api/circle)，[Ellipse](/zh/docs/api/ellipse) 为圆心位置
- [Rect](/zh/docs/api/rect)，[Image](/zh/docs/api/image) 为左上角顶点位置
- [Text](/zh/docs/api/text) 为文本锚点位置

有时我们需要更改这个 “位置” 的几何意义，例如将 Rect 的中心而非左上角设置成 “锚点”，此时我们可以使用 [anchor](/zh/docs/api/display-object#anchor)，将它设置成 `[0.5, 0.5]`。

### x

**类型**： `number`

**默认值**：0

**是否必须**：`false`

### y

**类型**： `number`

**默认值**：0

**是否必须**：`false`

### anchor

**类型**： `[number, number]`

**默认值**：`[0, 0]`

**是否必须**：`false`

**说明** 锚点位置，取值范围 `(0, 0) ~ (1, 1)`

### origin

**类型**： `[number, number]`

**默认值**：`[0, 0]`

**是否必须**：`false`

**说明** 旋转中心

## 填充

### opacity

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：透明度，取值范围为 `[0, 1]`

### fill

**类型**： `String`

**默认值**：无

**是否必须**：`false`

**说明**：填充色，例如 `'#1890FF'`

## 描边

### strokeOpacity

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：描边透明度，取值范围为 `[0, 1]`

### stroke

**类型**： `String`

**默认值**：无

**是否必须**：`false`

**说明**：描边色，例如 `'#1890FF'`

### lineWidth

**类型**： `number`

**默认值**：1

**是否必须**：`false`

**说明**：描边宽度

# 生命周期

每一个 DisplayObject 都有统一的生命周期，各个系统（包括 G 内部的核心系统）、自定义渲染器都可以通过注册生命周期的响应函数，完成对场景图、渲染效果的扩展。

```js
export const DisplayObjectHooks = {
  /**
   * get called at the end of constructor
   */
  init: new SyncHook() < [Entity, ShapeCfg] > ['entity', 'config'],
  /**
   * get called when attributes changed, eg. calling `attr/setAttribute()`
   */
  changeAttribute: new AsyncSeriesHook() < [Entity, string, any] > ['entity', 'name', 'value'],
  // hit: new SyncHook<[Entity]>(['entity']),
  /**
   * get called when mounted into canvas first time
   */
  mounted: new AsyncSeriesHook() < [RENDERER, any, Entity] > ['renderer', 'context', 'entity'],
  /**
   * get called every time renderred
   */
  render: new SyncHook() < [RENDERER, any, Entity] > ['renderer', 'context', 'entity'],
  /**
   * get called when unmounted from canvas
   */
  unmounted: new AsyncSeriesHook() < [RENDERER, any, Entity] > ['renderer', 'context', 'entity'],
  /**
   * get called when destroyed, eg. calling `destroy()`
   */
  destroy: new SyncHook() < [Entity] > ['entity'],
};
```

# 变换

## 平移

对于平移操作，我们提供了局部/世界坐标系下，移动绝对/相对距离的 API：

| 名称             | 参数               | 返回值             | 备注                                   |
| ---------------- | ------------------ | ------------------ | -------------------------------------- |
| translate        | `[number, number]` | 无                 | 在 **世界坐标系** 下，相对当前位置移动 |
| translateLocal   | `[number, number]` | 无                 | 在 **局部坐标系** 下，相对当前位置移动 |
| setPosition      | `[number, number]` | 无                 | 设置 **世界坐标系** 下的位置           |
| setLocalPosition | `[number, number]` | 无                 | 设置 **局部坐标系** 下的位置           |
| getPosition      | 无                 | `[number, number]` | 获取 **世界坐标系** 下的位置           |
| getLocalPosition | 无                 | `[number, number]` | 获取 **局部坐标系** 下的位置           |

## 缩放

和平移不同，我们无法提供 `setScale` 这样设置世界坐标系下缩放的方法，因此全局坐标系下缩放是只读的，这在 Unity 中称之为 [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| 名称          | 参数               | 返回值             | 备注                                           |
| ------------- | ------------------ | ------------------ | ---------------------------------------------- |
| scaleLocal    | `[number, number]` | 无                 | 在 **局部坐标系** 下，相对当前缩放比例继续缩放 |
| setLocalScale | `[number, number]` | 无                 | 设置 **局部坐标系** 下的缩放比例               |
| getScale      | 无                 | `[number, number]` | 获取 **世界坐标系** 下的缩放比例               |
| getLocalScale | 无                 | `[number, number]` | 获取 **局部坐标系** 下的缩放比例               |

## 旋转

在 3D 场景中，旋转可以用矩阵、轴角、欧拉角和四元数表示，它们彼此之间可以互相转换。虽然考虑到未来的扩展性，在 G 内部实现中我们使用了四元数，但目前我们仅提供欧拉角的 API。

| 名称                | 参数     | 返回值   | 备注                                                                    |
| ------------------- | -------- | -------- | ----------------------------------------------------------------------- |
| rotateLocal         | `number` | 无       | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate              | `number` | 无       | 在 **局部坐标系** 下，旋转一定的欧拉角                                  |
| setEulerAngles      | `number` | 无       | 设置 **世界坐标系** 下的欧拉角                                          |
| setLocalEulerAngles | `number` | 无       | 设置 **局部坐标系** 下的欧拉角                                          |
| getEulerAngles      | 无       | `number` | 获取 **世界坐标系** 下的欧拉角                                          |
| getLocalEulerAngles | 无       | `number` | 获取 **局部坐标系** 下的欧拉角                                          |

## 设置缩放和旋转中心

| 名称      | 参数               | 返回值 | 备注                             |
| --------- | ------------------ | ------ | -------------------------------- |
| setOrigin | `[number, number]` | 无     | 设置局部坐标系下的缩放和旋转中心 |

## 获取包围盒

| 名称      | 参数 | 返回值 | 备注                     |
| --------- | ---- | ------ | ------------------------ |
| getBounds | 无   | AABB   | 获取世界坐标系下的包围盒 |

# 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。
为此，我们参考 DOM API 中的 [Node 接口](https://developer.mozilla.org/en-US/docs/Web/API/Node) 在节点上定义了一系列属性与方法，同时提供了类似 CSS 选择器的节点查询方法，最大程度减少学习成本。

## 简单节点查询

| 名称            | 属性/方法 | 返回值    | 备注                           |
| --------------- | --------- | --------- | ------------------------------ | ------------------------------------ |
| parentNode      | 属性      | `Group    | null`                          | 父节点（如有）                       |
| children        | 属性      | `Group[]` | 子节点列表                     |
| firstChild      | 属性      | `Group    | null`                          | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `Group    | null`                          | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `Group    | null`                          | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `Group    | null`                          | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean` | 子树中是否包含某个节点（入参） |

## 高级查询

参考 CSS 选择器，我们提供了以下查询方法，查询范围是当前节点的**整棵子树**，并不仅仅是直接的子节点列表，而是所有子孙节点。

| 名称                   | 参数                  | 返回值          | 备注                            |
| ---------------------- | --------------------- | --------------- | ------------------------------- | -------------------- |
| getElementById         | `(id: string)`        | `Group          | null`                           | 通过 `id` 查询子节点 |
| getElementsByName      | `(name: string)`      | `Group[]`       | 通过 `name` 查询子节点列表      |
| getElementsByClassName | `(className: string)` | `Group[]`       | 通过 `className` 查询子节点列表 |
| getElementsByTagName   | `(tagName: string)`   | `Group[]`       | 通过 `tagName` 查询子节点列表   |
| querySelector          | `(selector: string)`  | `Group ｜ null` | 查询满足条件的第一个子节点      |
| querySelectorAll       | `(selector: string)`  | `Group[]`       | 查询满足条件的所有子节点列表    |

下面我们以上面太阳系的例子，演示如何使用这些查询方法。

```javascript
solarSystem.getElementsByName('sun');
// sun

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(SHAPE.Circle);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

## 添加/删除节点

| 名称         | 参数                                | 返回值  | 备注                                                 |
| ------------ | ----------------------------------- | ------- | ---------------------------------------------------- |
| appendChild  | `(group: Group)`                    | `Group` | 添加子节点，返回添加的节点                           |
| insertBefore | `(group: Group, reference?: Group)` | `Group` | 添加子节点，在某个子节点之前（如有），返回添加的节点 |
| removeChild  | `(group: Group)`                    | `Group` | 删除子节点，返回被删除的节点                         |

## 获取/设置属性值

| 名称         | 参数                         | 返回值 | 备注       |
| ------------ | ---------------------------- | ------ | ---------- | -------------------- |
| getAttribute | `(name: string)`             | `null  | any`       | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无     | 设置属性值 |

⚠️ 兼容旧版 `attr(name: string, value?: any)`，获取以及设置属性值。

# 可见性与渲染次序

## 隐藏/显示

| 名称 | 参数 | 返回值 | 备注     |
| ---- | ---- | ------ | -------- |
| hide | 无   | 无     | 隐藏节点 |
| show | 无   | 无     | 展示节点 |

另外我们也可以通过 `visibility` 属性控制：

```javascript
const group = new Group();

group.hide();
// or group.setAttribute('visibility', 'hidden');

group.show();
// or group.setAttribute('visibility', 'visible');
```

## 渲染次序

类似 CSS，我们可以通过 `z-index` 属性控制渲染次序，有两点需要注意：

1. 只会影响渲染顺序，并不会改变场景图中的节点结构
2. 只在当前上下文内生效

| 名称      | 参数     | 返回值 | 备注           |
| --------- | -------- | ------ | -------------- |
| setZIndex | `number` | 无     | 设置 `z-index` |
| toFront   | 无       | 无     | 置顶           |
| toBack    | 无       | 无     | 置底           |

```javascript
const group = new Group();

group.setZIndex(100);
// or group.setAttribute('z-index', 100);
```
