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
        onMouseenter={() => {
          setSize(100);
        }}
        onMouseleave={() => {
          setSize(50);
        }}
      />
    </Canvas>
  );
};

export default App;
