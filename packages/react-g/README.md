# @react-g/core

## API

### Container

Container include `Canvas` and `Group`.

### Shape

Shape include `Text`, `Circle`, `Ellipse`, `Image`, `Line`, `Marker`, `Path`, `Polygon` and `Polyline`.

## Example

### Basic usage

```tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Canvas,
    Group,
    Rect,
    Text,
    Circle,
    Ellipse,
    Image,
    Line,
    Marker,
    Path,
    Polygon,
    Polyline,
} from 'react-g-canvas';
import { IShape } from '@antv/g-canvas';

const App: React.FC = () => {
    return (
        <Canvas width={1000} height={800}>
            <Group>
                <Text x={200} y={60} text="测试文字" fill="black" textBaseline="top" />
                <Circle x={200} y={60} r={30} stroke="black" />
                <Ellipse x={100} y={120} rx={30} ry={20} stroke="red" ref={shapeRef} />
                <Image
                    x={100}
                    y={120}
                    width={200}
                    height={80}
                    img="https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2534506313,1688529724&fm=26&gp=0.jpg"
                />
                <Line x1={200} y1={60} x2={100} y2={120} stroke="black" startArrow endArrow />
            </Group>
            <Rect x={20} y={20} width={100} height={50} fill="blue" stroke="#456734" />
            <Group>
                <Group>
                    <Rect x={10} y={10} width={100} height={50} fill={color} stroke="#456734" />
                </Group>
                <Marker x={100} y={100} r={10} symbol="square" stroke="blue" />
                <Marker
                    x={250}
                    y={200}
                    r={10}
                    symbol={(x, y, r) => {
                        return [
                            ['M', x - r, y],
                            ['L', x + r, y],
                        ];
                    }}
                    stroke="green"
                />
                <Path
                    startArrow={{
                        path: 'M 10,0 L -10,-10 L -10,10 Z', // 自定义箭头为中心点在(0, 0)，指向 x 轴正方向的path
                        d: 10,
                    }}
                    endArrow={{
                        path: 'M 10,0 L -10,-10 L -10,10 Z', // 自定义箭头为中心点在(0, 0)，指向 x 轴正方向的path
                        d: 10,
                    }}
                    path={[
                        ['M', 300, 100],
                        ['L', 400, 200],
                    ]}
                    stroke="#000"
                    lineWidth={8}
                />
                <Polygon
                    points={[
                        [30, 30],
                        [40, 20],
                        [30, 50],
                        [60, 100],
                    ]}
                    fill="grey"
                />
                <Polyline
                    points={[
                        [100, 30],
                        [200, 20],
                        [200, 50],
                        [300, 100],
                    ]}
                    stroke="blue"
                    startArrow
                    endArrow
                />
            </Group>
        </Canvas>
    );
};

export default App;
```

### Use with ref

Like react-dom, you can use `ref` to access the object in [@antv/g](https://github.com/antvis/g).
