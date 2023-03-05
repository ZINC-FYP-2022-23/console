/**
 * @file Types for graph-related data structures.
 */

/**
 * A directed graph represented as an adjacency list. Each key is the node ID, while its value is an
 * array of node IDs that are reachable from that node.
 *
 * @example
 * const graph: DirectedGraph = { A: ["B"], B: ["C"], C: [] };  // A -> B -> C
 */
export type DirectedGraph = { [nodeId: string]: string[] };
