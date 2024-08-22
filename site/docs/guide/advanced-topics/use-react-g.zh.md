---
title: 使用 React 定义图形
order: 5
---

react 通过 `react-reconciler` 提供了自定义 render 的能力，`react-g` 便是一个 react 到 g 的 render。

`react-g` 目前处于实验状态，欢迎试用和反馈。

## 安装

```sh
npm i @antv/react-g
```

## 使用方式

react-g 提供以下内置组件，可以直接引入使用，属性和原生的 g 对象是一致的:

-   Container: `Canvas` and `Group`.
-   Shape: `Text`, `Circle`, `Ellipse`, `Image`, `Line`, `Marker`, `Path`, `Polygon` and `Polyline`.

### 基本用法

```tsx
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Canvas, Circle } from '@antv/react-g';
import { useState } from 'react';

const renderer = new CanvasRenderer();

const App = () => {
    const [size, setSize] = useState(50);
    return (
        <Canvas width={600} height={400} renderer={renderer}>
            <Circle
                x={100}
                y={200}
                r={size}
                fill="#1890FF"
                stroke="#F04864"
                lineWidth={4}
                onClick={() => {
                    setSize(100);
                }}
            />
        </Canvas>
    );
};

export default App;
```

### 使用 ref 可以获取 g 中的对象实例

```tsx
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Canvas, Circle } from '@antv/react-g';
import { useRef, useState } from 'react';

const renderer = new CanvasRenderer();

const App = () => {
    const circleRef = useRef();
    const [size, setSize] = useState(50);
    return (
        <Canvas width={600} height={400} renderer={renderer}>
            <Circle
                ref={circleRef}
                x={100}
                y={200}
                r={size}
                fill="#1890FF"
                stroke="#F04864"
                lineWidth={4}
                onClick={() => {
                    setSize(100);
                }}
            />
        </Canvas>
    );
};

export default App;
```

### 使用 `render` 函数可以将 react-g 的组件渲染到已有的 g 对象实例中

-   将 react-g 组件渲染到任意的 g 实例（Canvas/Group/Shape）中
-   意味着可以将 react-g 组件渲染到 g2,g6 等其他库中

```tsx
import { Canvas as GCanvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Circle, render } from '@antv/react-g';
import { useState } from 'react';

const renderer = new CanvasRenderer();

const CircleComponent = () => {
    const [size, setSize] = useState(50);
    return (
        <Circle
            x={100}
            y={200}
            r={size}
            fill="#1890FF"
            stroke="#F04864"
            lineWidth={4}
            onMouseenter={() => {
                setSize(100);
            }}
            onMouseleave={() => {
                setSize(50);
            }}
        />
    );
};

const canvas = new GCanvas({
    container: 'container', // DOM 节点id
    width: 600,
    height: 500,
    renderer,
});

// canvas can also be group/shape
render(<CircleComponent />, canvas);
```
