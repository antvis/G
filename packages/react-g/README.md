# react-g

react render for @antv/g

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

## API

### Container

Container include `Canvas` and `Group`.

### Shape

Shape include `Text`, `Circle`, `Ellipse`, `Image`, `Line`, `Marker`, `Path`, `Polygon` and `Polyline`.

## Example

### Basic usage

### Use with ref

Like react-dom, you can use `ref` to access the object in [@antv/g](https://github.com/antvis/g).
