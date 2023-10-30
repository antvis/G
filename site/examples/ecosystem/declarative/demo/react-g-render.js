import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas as GCanvas, Group as GGroup, runtime } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import {
  Circle,
  Ellipse,
  Line,
  Polyline,
  Path,
  Text,
  Rect,
  Group,
  render,
} from '@antv/react-g';

const CustomShape = () => {
  const [size, setSize] = useState(100);
  return (
    <Circle cx={100} cy={100} r={size} stroke="#ff0000" lineWidth={2}>
      <Circle r={50} stroke="#ff0000" lineWidth={2}>
        <Group>
          <Group>
            <Line
              x1={0}
              y1={0}
              x2={-50}
              y2={-50}
              stroke="#ff0000"
              lineWidth={2}
            />
          </Group>
        </Group>
        <Path path="M40 40 L100 40 L100 -100" stroke="green" lineWidth={2} />
        <Polyline
          points={[
            [0, 0],
            [100, 100],
          ]}
          stroke="blue"
          lineWidth={2}
        />
        <Ellipse cx={-50} cy={-50} rx={20} ry={10} fill="red" />
        <Rect
          width={50}
          height={50}
          stroke="black"
          lineWidth={2}
          opacity={0.5}
          fill="red"
          cursor="pointer"
          onMouseenter={() => {
            setSize(80);
          }}
          onMouseleave={() => {
            setSize(100);
          }}
        >
          <Text
            fill="black"
            text="Hover me!"
            fontSize={20}
            fontFamily="PingFang SC"
          />
        </Rect>
      </Circle>
    </Circle>
  );
};

const App = () => {
  useEffect(() => {
    // runtime.enableCSSParsing = false;

    const canvas = new GCanvas({
      container: 'C',
      width: 500,
      height: 500,
      renderer: new Renderer(), // select a renderer
    });

    const group = new GGroup();
    canvas.appendChild(group);

    render(<CustomShape />, group);

    console.log(group);
  }, []);

  return <div id="C"></div>;
};

ReactDOM.render(<App />, document.getElementById('container'));
