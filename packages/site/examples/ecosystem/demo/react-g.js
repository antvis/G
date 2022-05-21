import { Renderer as CanvasRenderer } from '@antv/g-webgl';
import { Canvas, Circle } from '@antv/react-g';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

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

ReactDOM.render(<App />, document.getElementById('container'));
