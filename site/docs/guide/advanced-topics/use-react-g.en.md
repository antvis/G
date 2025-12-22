---
title: Using React to Define Graphics
order: 5
---

React provides the ability to create custom renderers through `react-reconciler`, and `react-g` is a renderer from React to G.

`react-g` is currently in an experimental state. We welcome you to try it out and provide feedback.

## Installation

```sh
npm i @antv/react-g
```

## Usage

`react-g` provides the following built-in components that can be directly imported and used. Their properties are consistent with the native G objects:

- Container: `Canvas` and `Group`.
- Shape: `Text`, `Circle`, `Ellipse`, `Image`, `Line`, `Marker`, `Path`, `Polygon`, and `Polyline`.

### Basic Usage

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

### Using `ref` to get the G object instance

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

### Using the `render` function to render `react-g` components into existing G object instances

- Render `react-g` components into any G instance (Canvas/Group/Shape).
- This means that `react-g` components can be rendered into other libraries such as G2, G6, etc.

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
    container: 'container', // DOM node id
    width: 600,
    height: 500,
    renderer,
});

// canvas can also be a group/shape
render(<CircleComponent />, canvas);
```
