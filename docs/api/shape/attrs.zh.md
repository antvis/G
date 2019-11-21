---
title: Attrs 绘图属性
order: 5
---

## 样式属性

### fill

- 设置用于填充绘画的颜色、[渐变](/zh/docs/api/shape/attrs/#渐变色)或 [纹理](/zh/docs/api/shape/attrs/#纹理)，默认值为空；

### stroke

- - 设置用于填充绘画的颜色、[渐变](/zh/docs/api/shape/attrs/#渐变色)或 [纹理](/zh/docs/api/shape/attrs/#纹理)，默认值为空；

### shadowColor

- 设置用于阴影的颜色；

### shadowBlur

- 设置用于阴影的模糊级别；

### shadowOffsetX

- 设置阴影距形状的水平距离；

### shadowOffsetY

- 设置阴影距形状的垂直距离；

### opacity

- 设置绘图的当前 alpha 或透明值；

### globalCompositeOperation

- 设置新图像如何绘制到已有的图像上；

## 线条属性

### lineCap

- 设置线条的结束端点样式；

### lineJoin

- 设置两条线相交时，所创建的拐角形状，属性值有:
  - `bevel`: 斜角
  - `round`: 圆角
  - `miter`: 尖角 (默认)

### lineWidth

- 设置当前的线条宽度，默认值为 1；

### lineAppendWidth

- 设置额外的线条宽度，且不可见，常用于增加图形的可拾取区域，默认值为 0；

### miterLimit

- 设置最大斜接长度；

### lineDash

> 这个属性取决于浏览器是否支持 setLineDash 函数，详情参考 [setLineDash](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)。

- 设置线的虚线样式，可以指定一个数组。一组描述交替绘制线段和间距（坐标空间单位）长度的数字。 如果数组元素的数量是奇数， 数组的元素会被复制并重复。例如， [5, 15, 25] 会变成 [5, 15, 25, 5, 15, 25]。

### startArrow

- 设置起点箭头，值的类型为 `boolean | ArrowCfg | Marker`：

  - `true / false`: 显示 / 取消默认箭头；
  - `ArrowCfg`: 自定义箭头，具体配置为:

    ```js
    startArrow: {
      path: 'M 10,0 L -10,-10 L -10,10 Z', // 箭头路径
      d: 10  // 箭头偏移量
    }
    ```

  - `Marker`: 定义 Marker 类型的箭头:

    ```js
    startArrow: new Marker({
      attrs: {
        // ...
      },
    });
    ```

### endArrow

- 设置终点箭头，配置同 [startArrow](#startarrow)。

## 文本属性

### font

- 设置文本内容的当前字体属性；

### textAlign

- 设置文本内容的当前对齐方式, 支持的属性值：
  - center
  - end
  - left
  - right
  - start

### textBaseline

- 设置在绘制文本时使用的当前文本基线, 支持的属性：
  - top
  - middle
  - bottom

### fontStyle

- 设置字体样式；

### fontVariant

- 设置小型大写字母的字体显示文本；

### fontWeight

- 设置字体粗细；

### fontSize

- 设置字体尺寸；

### fontFamily

- 设置字体类型；

## 渐变色

### 线性渐变

![](https://gw.alipayobjects.com/zos/rmsportal/ieWkhtoHOijxweuNFWdz.png)

- `l` 表示使用线性渐变，绿色的字体为可变量，由用户自己填写。

```js
// example
// 使用渐变色描边，渐变角度为 0，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

### 放射状/环形渐变

![](https://gw.alipayobjects.com/zos/rmsportal/qnvmbtSBGxQlcuVOWkdu.png#width=)

- `r` 表示使用放射状渐变，绿色的字体为可变量，由用户自己填写，开始圆的 `x`、`y`、`r` 值均为相对值(0 至 1 范围)。

```js
// example
// 使用渐变色填充，渐变起始圆的圆心坐标为被填充物体的包围盒中心点，半径为(包围盒对角线长度 / 2) 的 0.1 倍，渐变的起始点颜色 #ffffff，中点的渐变色为 #7ec2f3，结束的渐变色为 #1890ff
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```

## 纹理

![](https://gw.alipayobjects.com/zos/rmsportal/NjtjUimlJtmvXljsETAJ.png#width=)

- `p`: 表示使用纹理，绿色的字体为可变量，由用户自己填写。
- `a`: 该模式在水平和垂直方向重复；
- `x`: 该模式只在水平方向重复；
- `y`: 该模式只在垂直方向重复；
- `n`: 该模式只显示一次（不重复）。
- 纹理的内容可以直接是图片或者 [Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)。

```js
// example
// 使用纹理填充，在水平和垂直方向重复图片
fill: 'p(a)https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';
```
