/**
 * @file Graph-related utilities.
 */

import { DirectedGraph } from "@/types/GuiBuilder";
import cloneDeep from "lodash/cloneDeep";

/**
 * Deletes a node and all the edges pointing to that node from a directed graph.
 * @param target The ID of the node to be deleted.
 * @param graph The original graph (i.e. this object) will not be modified.
 */
export function deleteNodeFromGraph(target: string, graph: DirectedGraph) {
  const output = cloneDeep(graph);

  if (!(target in graph)) {
    console.warn(`Cannot delete node of ID "${target}" because it does not exist.`);
    return output;
  }

  delete output[target];
  Object.entries(output).forEach(([id, children]) => {
    output[id] = children.filter((child) => child !== target);
  });

  return output;
}

/**
 * Determines if a directed graph is a linked list.
 * @example
 * const linkedListGraph = { A: ["B"], B: ["C"], C: [] };  // A -> B -> C
 * const disconnectedGraph = { A: [], B: ["C"], C: [] };  // A  B -> C
 * console.log(isLinkedList(linkedListGraph));  // true
 * console.log(isLinkedList(disconnectedGraph));  // false
 */
export function isLinkedList(graph: DirectedGraph): boolean {
  /** List of node IDs where its out-degree is 0. */
  const nodesWithoutChildren: string[] = [];

  for (const [key, children] of Object.entries(graph)) {
    // The maximum out-degree of every node in a linked list is 1 (i.e. no branches)
    if (children.length > 1) return false;
    if (children.length === 0) nodesWithoutChildren.push(key);
  }

  // A linked list must have exactly one node without children (i.e. the tail)
  if (nodesWithoutChildren.length !== 1) return false;

  /** If the input graph is a linked list, the transposed graph must be a linked list */
  const transposedGraph = transposeGraph(graph);
  const transposedGraphHeadNode = nodesWithoutChildren[0];

  // Traverse the transposed graph from the head node to make sure it's a linked list

  /** Tracks each node in the transposed graph to see if it has been traversed. */
  const visitedNodes: Record<string, boolean> = {};
  Object.keys(transposedGraph).forEach((key) => (visitedNodes[key] = false));

  let currentNode = transposedGraphHeadNode;
  while (currentNode) {
    visitedNodes[currentNode] = true;

    const currentNodeChildren = transposedGraph[currentNode];
    if (currentNodeChildren.length === 0) break;

    currentNode = currentNodeChildren[0];
  }
  return Object.values(visitedNodes).every((visited) => visited);
}

/**
 * Transposes a directed graph by reversing all the edge directions.
 * @param graph The original graph (i.e. this object) will not be modified.
 * @returns An adjacency list of the transposed graph.
 * @example
 * const graph = { "A": ["B"], "B": ["C"], "C": [] }; // C <- B <- A
 * const transposed = transposeGraph(graph); // C -> B -> A
 * console.log(transposed); // { A: [], B: ["A"], C: ["B"] }
 */
export function transposeGraph(graph: DirectedGraph): DirectedGraph {
  const output: DirectedGraph = {};

  Object.entries(graph).forEach(([node, children]) => {
    if (!(node in output)) {
      output[node] = [];
    }
    children.forEach((child) => {
      if (child in output) {
        output[child].push(node);
      } else {
        output[child] = [node];
      }
    });
  });

  return output;
}
