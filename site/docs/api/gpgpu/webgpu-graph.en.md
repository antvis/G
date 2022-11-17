---
title: webgpu-graph
order: 6
---

We refer to [cuGraph](https://github.com/rapidsai/cugraph) and other CUDA implementations to implement common graph analysis algorithms based on the WebGPU capabilities behind [g-plugin-gpgpu](/en/plugins/gpgpu) to achieve large-scale node edge data volume.

This is a significant improvement over the [CPU serial version](https://github.com/antvis/algorithm) currently offered by G6.

| Algorithm name | Node / Edge           | CPU time consumption | GPU time consumption | Speed up |
| -------------- | --------------------- | -------------------- | -------------------- | -------- |
| SSSP           | 1k Nodes & 5k Edges   | 27687.10 ms          | 261.60 ms            | ~100x    |
| PageRank       | 1k Nodes & 500k Edges | 13641.50 ms          | 130.20 ms            | ~100x    |

## Pre-requisites

Before using it, you need to confirm the operating environment and data as two preconditions.

### WebGPU Operating Environment

WebGPU is currently (2022-3-21) supported in Chrome 94 official version and above, but since we are using the latest WGSL syntax, it is recommended to update your browser to the latest version.

For production use at this time, Origin Trial will need to be enabled to support WebGPU features (no longer required for Chrome 100+).

-   [Get Token](https://developer.chrome.com/origintrials/#/view_trial/118219490218475521)
-   Add the `<meta>` tag to the page with the Token obtained in the previous step, e.g. via the DOM API.

```js
const tokenElement = document.createElement('meta');
tokenElement.httpEquiv = 'origin-trial';
tokenElement.content = 'AkIL...5fQ==';
document.head.appendChild(tokenElement);
```

### Graph data format

We use G6's [graph data format](https://g6.antv.vision/en/manual/getting-started#step-2-%E6%95%B0%E6%8D%AE%E5%87%86%E5%A4%87), which is also the first fixed of all the following algorithms parameters.

```js
const data = {
    // 点集
    nodes: [
        {
            id: 'node1', // String，该节点存在则必须，节点的唯一标识
            x: 100, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
        },
        {
            id: 'node2', // String，该节点存在则必须，节点的唯一标识
            x: 300, // Number，可选，节点位置的 x 值
            y: 200, // Number，可选，节点位置的 y 值
        },
    ],
    // 边集
    edges: [
        {
            source: 'node1', // String，必须，起始点 id
            target: 'node2', // String，必须，目标点 id
        },
    ],
};
```

If the data format does not meet the above requirements, the algorithm will not execute properly.

## Usage

We offer the following two ways to use it.

-   [Canvas](/en/api/canvas) without G. You only want to use it to execute the algorithm, no rendering is involved. This is also the easiest way to use it.
-   There is already a [Canvas](/en/api/canvas) for G, e.g. it is being used for rendering, and only the algorithm needs to be called at this point.

### Method 1

A WebGPUGraph is created and a series of initialization work such as canvas creation and plugin registration is done internally. Once completed, the algorithm is called directly.

```js
import { WebGPUGraph } from '@antv/webgpu-graph';
const graph = new WebGPUGraph();

(async () => {
    const result = await graph.pageRank(data);
})();
```

### Method 2

If you are already using G's Canvas for rendering, you can reuse it and do the following.

-   Register [g-plugin-gpgpu](/en/plugins/gpgpu)
-   Waiting for the canvas to initialize
-   Get GPU [Device](/en/plugins/device-renderer#device)
-   The algorithm is called, and the first parameter of the algorithm is the Device obtained in the previous step

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { Plugin } from '@antv/g-plugin-gpgpu';
import { pageRank } from '@antv/webgpu-graph';

const webglRenderer = new Renderer();
webglRenderer.registerPlugin(new Plugin());

const canvas = new Canvas({
    container: 'my-canvas-id',
    width: 1,
    height: 1,
    renderer: webglRenderer,
});

(async () => {
    // Wait for the canvas initialization to complete
    await canvas.ready;

    // Get Device by Renderer
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // Call the algorithm, pass in Device and graph data
    const result = await pageRank(device, data);
})();
```

All the following algorithms are called asynchronously.

## Link Analysis

### PageRank

The list of parameters is as follows.

| name         | type      | isRequired | description                                                                                                                                                  |
| ------------ | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| graphData    | GraphData | true       |                                                                                                                                                              |
| epsilon      | number    | false      | The precision value to determine if the PageRank score is stable, default value is `1e-05`.                                                                  |
| alpha        | number    | false      | The dumping factor is the probability that a user will continue to access the node pointed to by a node at any given moment, with a default value of `0.85`. |
| maxIteration | number    | false      | Number of iterations, default value is `1000`                                                                                                                |

The return value is an array of results containing the `id` and `score` attributes, in the form `[{ id: 'A', score: 0.38 }, { id: 'B', score: 0.32 }...] `.

The array elements have been sorted by `score` from highest to lowest, so the first element represents the node with the highest importance.

Refer to the following CUDA version implementation.

-   https://github.com/princeofpython/PageRank-with-CUDA/blob/main/parallel.cu
-   https://docs.rapids.ai/api/cugraph/stable/api_docs/api/cugraph.dask.link_analysis.pagerank.pagerank.html

It is used in the following way, [example](/en/examples/gpgpu#webgpu-graph-pagerank)：

```js
const result = await graph.pageRank(data);
// [{id: 'B', score: 0.3902697265148163}, {}...]
```

There is a very significant improvement in larger point-side scenarios.

| Algorithm name | Node / Edge           | CPU time consumption | GPU time consumption | Speed up |
| -------------- | --------------------- | -------------------- | -------------------- | -------- |
| PageRank       | 1k Nodes & 500k Edges | 13641.50 ms          | 130.20 ms            | ~100x    |

## Traversal

### SSSP

Single source shortest path, i.e., the shortest path from one node to all other nodes.

The list of parameters is as follows.

| name      | type      | isRequired | description                                          |
| --------- | --------- | ---------- | ---------------------------------------------------- |
| graphData | GraphData | true       | 图数据                                               |
| source    | number    | false      | 判断 PageRank 得分是否稳定的精度值，默认值为 `1e-05` |

Refer to the following CUDA version implementations.

-   https://www.lewuathe.com/illustration-of-distributed-bellman-ford-algorithm.html
-   https://github.com/sengorajkumar/gpu_graph_algorithms
-   https://docs.rapids.ai/api/cugraph/stable/api_docs/api/cugraph.traversal.sssp.sssp.html

### APSP

[Accelerating large graph algorithms on the GPU using CUDA](https://link.zhihu.com/?target=http%3A//citeseerx.ist.psu.edu/viewdoc/download%3Fdoi%3D10.1.1.102.4206%26rep%3Drep1%26type%3Dpdf)

### BFS

-   [Scalable GPU Graph Traversal](https://research.nvidia.com/publication/scalable-gpu-graph-traversal)
-   https://github.com/rafalk342/bfs-cuda
-   https://github.com/kaletap/bfs-cuda-gpu

### DFS

https://github.com/divyanshu-talwar/Parallel-DFS

## Nodes clustering

### K-Means

-   [A CUDA Implementation of the K-Means Clustering Algorithm](http://alexminnaar.com/2019/03/05/cuda-kmeans.html)
-   ["Yinyang" K-means and K-nn using NVIDIA CUDA](https://github.com/src-d/kmcuda)

## Community Detection

### Louvain

-   [Demystifying Louvain’s Algorithm and Its implementation in GPU](https://medium.com/walmartglobaltech/demystifying-louvains-algorithm-and-its-implementation-in-gpu-9a07cdd3b010)
-   https://docs.rapids.ai/api/cugraph/stable/api_docs/api/cugraph.louvain.html
-   https://github.com/rapidsai/cugraph/tree/branch-22.08/cpp/src/community

### K-Core

[K-Core Decomposition with CUDA](https://bora.uib.no/bora-xmlui/bitstream/handle/11250/2720504/Master_Thesis_done.pdf?sequence=1)

### Label Propagation

-   Parallel Graph Component Labelling with GPUs and CUDA
-   GPU-Accelerated Graph Label Propagation for Real-Time Fraud Detection

### minimumSpanningTree

-   https://github.com/jiachengpan/cudaMST
-   https://github.com/Dibyadarshan/GPU-Based-Fast-Minimum-Spanning-Tree

## Similarity

### Cosine Similarity

https://github.com/adamantmc/CudaCosineSimilarity

### Nodes Cosine Similarity

## Others

### DFS

https://github.com/divyanshu-talwar/Parallel-DFS

### Cycle Detection

https://github.com/hamham240/cudaGraph/blob/main/src/algos/cudaCD.cu
