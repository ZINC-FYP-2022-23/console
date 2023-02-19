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
