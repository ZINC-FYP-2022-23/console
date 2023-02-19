import { DirectedGraph } from "@/types/GuiBuilder";
import { deleteNodeFromGraph, isLinkedList, transposeGraph } from "../graph";

/** A graph that consists of a single node `A`. */
const singleNodeGraph: DirectedGraph = { A: [] };

/**
 * ```text
 * A -> B -> C
 * ```
 */
const linkedListGraph: DirectedGraph = {
  A: ["B"],
  B: ["C"],
  C: [],
};

/**
 * ```text
 *    ┌─> B ─┐
 * A ─┴─> C ─┴─> D
 * ```
 */
const branchedDAG: DirectedGraph = {
  A: ["B", "C"],
  B: ["D"],
  C: ["D"],
  D: [],
};

/**
 * ```text
 * A   B -> C
 * ```
 */
const disconnectedGraph: DirectedGraph = {
  A: [],
  B: ["C"],
  C: [],
};

describe("GuiBuilder: Utils - Graph", () => {
  test("deleteNodeFromGraph()", () => {
    // Delete the only node in a graph
    expect(deleteNodeFromGraph("A", singleNodeGraph)).toEqual({});

    // Delete a node in the middle of a linked list
    expect(deleteNodeFromGraph("B", linkedListGraph)).toEqual({ A: [], C: [] });

    // Delete a node at the end of a linked list
    expect(deleteNodeFromGraph("C", linkedListGraph)).toEqual({ A: ["B"], B: [] });

    // Delete a node in the middle of a branched DAG
    expect(deleteNodeFromGraph("C", branchedDAG)).toEqual({
      A: ["B"],
      B: ["D"],
      D: [],
    });

    // Delete a disconnected node
    expect(deleteNodeFromGraph("A", disconnectedGraph)).toEqual({ B: ["C"], C: [] });

    // Handles deleting a node that does not exist
    const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();
    expect(deleteNodeFromGraph("foo", linkedListGraph)).toEqual(linkedListGraph);
    consoleWarnMock.mockRestore();
  });

  test("transposeGraph()", () => {
    expect(transposeGraph(linkedListGraph)).toEqual({
      // A <- B <- C
      A: [],
      B: ["A"],
      C: ["B"],
    });

    expect(transposeGraph(branchedDAG)).toEqual({
      //     ┌─ B <─┐
      // A <─┴─ C <─┴─ D
      A: [],
      B: ["A"],
      C: ["A"],
      D: ["B", "C"],
    });

    expect(transposeGraph(disconnectedGraph)).toEqual({
      // A   B <- C
      A: [],
      B: [],
      C: ["B"],
    });
  });
});
