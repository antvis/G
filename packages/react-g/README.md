# react-g

react render for @antv/g

## Install

```sh
npm i @antv/react-g
```

## Usage

react-g provide host-component:

-   Container: `Canvas` and `Group`.
-   Shape: `Text`, `Circle`, `Ellipse`, `Image`, `Line`, `Marker`, `Path`, `Polygon` and `Polyline`.

### Basic usage

```tsx
import React, { useState } from 'react';
import { Canvas, Circle } from '@antv/react-g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

const renderer = new CanvasRenderer();

const App = () => {
    const [size, setSize] = useState(50);
    return (
        <Canvas width={600} height={400} renderer={renderer}>
            <Circle
                cx={100}
                cy={200}
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

### Use ref to access shape instance

Like react-dom, you can use `ref` to access the shape instance.

```tsx
import React, { useState, useRef } from 'react';
import { Canvas, Circle } from '@antv/react-g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

const renderer = new CanvasRenderer();

const App = () => {
    const circleRef = useRef();
    const [size, setSize] = useState(50);
    return (
        <Canvas width={600} height={400} renderer={renderer}>
            <Circle
                ref={circleRef}
                cx={100}
                cy={200}
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

### `render` react-g component to target g element

-   将 react-g 组件渲染到任意的 g 实例（Canvas/Group/Shape）中
-   意味着可以将 react-g 组件渲染到 g2,g6 等其他库中

```tsx
import React, { useState } from 'react';
import { Canvas as GCanvas } from '@antv/g';
import { Circle, render } from '@antv/react-g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

const renderer = new CanvasRenderer();

const CircleComponent = () => {
    const [size, setSize] = useState(50);
    return (
        <Circle
            cx={100}
            cy={200}
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
