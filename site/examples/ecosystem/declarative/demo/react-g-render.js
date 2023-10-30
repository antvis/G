import { Canvas, Group as GGroup } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Circle, render } from '@antv/react-g';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const Test = () => {
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
        console.log('mouseenter...');
        setSize(100);
      }}
      onMouseleave={() => {
        console.log('mousleave...');
        setSize(50);
      }}
    />
  );
};

const App = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      const canvas = new Canvas({
        container: containerRef.current,
        width: 600,
        height: 400,
        renderer: new Renderer(),
      });

      const group = new GGroup();
      canvas.appendChild(group);

      render(<Test />, group);

      containerRef.current = null;
    }
  }, []);

  return <div ref={containerRef}></div>;
};

ReactDOM.render(<App />, document.getElementById('container'));
