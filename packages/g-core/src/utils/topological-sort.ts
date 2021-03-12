import sortBy from 'lodash-es/sortBy';

type Node = {
  id: number;
  children: Node[];
};

/**
 * DFS
 * @see https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
 * @see https://www.geeksforgeeks.org/topological-sorting/
 */
function topologicalSortHelper(
  node: number,
  visited: Record<number, boolean>,
  temp: Record<number, boolean>,
  graph: Record<number, number[]>,
  result: number[],
  priority: Record<number, number>
) {
  temp[node] = true;
  const neighbors = graph[node] || [];

  for (let i = 0; i < neighbors.length; i += 1) {
    const n = neighbors[i];
    if (temp[n]) {
      throw new Error('The graph is not a DAG');
    }
    if (!visited[n]) {
      topologicalSortHelper(n, visited, temp, graph, result, priority);
    }
  }
  // remove temporary mark from n
  temp[node] = false;
  // mark n with a permanent mark
  visited[node] = true;
  // add n to head of L
  result.push(node);
}
/**
 * Topological sort algorithm of a directed acyclic graph.<br><br>
 * Time complexity: O(|E| + |V|) where E is a number of edges
 * and |V| is the number of nodes.
 *
 * @example
 * const graph = {
 *     v1: ['v2', 'v5'],
 *     v2: [],
 *     v3: ['v1', 'v2', 'v4', 'v5'],
 *     v4: [],
 *     v5: []
 * };
 * const vertices = topsort(graph); // ['v3', 'v4', 'v1', 'v5', 'v2']
 */
export function topologicalSort(graph: Record<number, number[]>, priority: Record<number, number> = {}) {
  const result: number[] = [];
  const visited: Record<number, boolean> = {};
  const temp: Record<number, boolean> = {};

  for (const node in graph) {
    if (!visited[node] && !temp[node]) {
      topologicalSortHelper(Number(node), visited, temp, graph, result, priority);
    }
  }

  return result.reverse();

  // use stable sort instead of unstable `Array.sort`
  // return sortBy(result, (a, b) => priority[a] - priority[b]);
}
