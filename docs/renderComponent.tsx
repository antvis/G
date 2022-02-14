import React, { useState, useEffect, useRef } from 'react';
import { Canvas as GCanvas } from '@antv/g';
import { Circle, render } from '@antv/react-g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

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

const App = () => {
  const divRef = useRef();

  useEffect(() => {
    const canvas = new GCanvas({
      container: divRef.current, // DOM 节点id
      width: 600, // 画布宽度
      height: 500, // 画布高度
      renderer,
    });

    render(<CircleComponent />, canvas);
  });

  return <div ref={divRef} />;
};

export default App;
