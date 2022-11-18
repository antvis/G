---
title: 雾
order: 5
---

雾和光源一样，都属于场景级别的对象，距离相机近处的物体能见度较大。

在下面的 [示例](/zh/examples/3d#sphere) 中展示了红色的雾，注意远离相机的地方（球体边缘处）：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LBDUTJiLjHEAAAAAAAAAAAAAARQnAQ" height='300'/>

```js
const fog = new Fog();
canvas.appendChild(fog);
```

当不需要时可以随时移除：

```js
canvas.removeChild(fog);
```

整个场景中只会有一个 Fog 生效，因此添加多个无效。

## 基础样式

### fill

颜色，默认值为 `'black'`

### type

类型，支持以下枚举值，默认为 `FogType.NONE`，即无效果：

```js
export enum FogType {
  NONE = 0,
  EXP = 1,
  EXP2 = 2,
  LINEAR = 3,
}
```

### density

效果强度，默认值为 0

### start

type 取 `FogType.LINEAR` 时生效。最近距离，默认值为 1

### end

type 取 `FogType.LINEAR` 时生效。最远距离，默认值为 1000
