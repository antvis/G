# Shape

```tsx
import React from 'react';
import { Canvas, Circle } from '@antv/react-g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

const renderer = new WebGLRenderer();

const App = () => {
    return (
        <Canvas width={600} height={500} renderer={renderer}>
            <Circle x={100} y={200} r={50} />{' '}
        </Canvas>
    );
};

export default App;
```
