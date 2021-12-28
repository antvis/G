# Shape

```tsx
import React from 'react';
import { Canvas, Circle } from '@antv/react-g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

const renderer = new CanvasRenderer();

const App = () => {
    return (
        <Canvas width={600} height={400} renderer={renderer}>
            <Circle x={100} y={200} r={50} fill="#1890FF" stroke="#F04864" lineWidth={4} />
        </Canvas>
    );
};

export default App;
```
