import PipelineStages from "@/components/GuiBuilder/Steps/PipelineStages";
import supportedStages from "@/constants/GuiBuilder/supportedStages";
import { GuiBuilderModel, guiBuilderModel } from "@/store/GuiBuilder";
import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { StageDependencyGraph } from "@/types/GuiBuilder";
import { Store, createStore } from "easy-peasy";
import cloneDeep from "lodash/cloneDeep";

const mountPipelineStagesWithStore = (store: Store<GuiBuilderModel>) => {
  cy.mountWithStore(
    store,
    <div className="bg-gray-100" style={{ height: 800 }}>
      <PipelineStages />
    </div>,
  );
};

/**
 * Drags a stage block from Add New Stage panel to the pipeline canvas.
 * @param label Label of the stage block to drag.
 * @param target Location to drop the block to.
 */
const dragStageBlockToCanvas = (label: string, target: { x: number; y: number }) => {
  // @ts-ignore
  cy.get('[draggable="true"]').contains(label).drag(".react-flow", { target });
};

/**
 * Drags from the right handle of source stage to the left handle of target stage.
 * @param sourceLabel Label of the source stage block.
 * @param targetLabel Label of the target stage block.
 */
const connectStageBlocks = (sourceLabel: string, targetLabel: string) => {
  const sourceSelector = `.stage-node[data-label="${sourceLabel}"] div[data-handlepos="right"]`;
  const targetSelector = `.stage-node[data-label="${targetLabel}"] div[data-handlepos="left"]`;

  // We're not using cy.drag() provided by "@4tw/cypress-drag-drop" package. This is because
  // that package has a bug where the mouse button is not released after cy.drag() ends.

  let sourceHandleRect: DOMRect;
  let targetHandleRect: DOMRect;

  cy.get(sourceSelector).then((handle) => {
    sourceHandleRect = handle.get(0).getBoundingClientRect();
  });
  cy.get(targetSelector).then((handle) => {
    targetHandleRect = handle.get(0).getBoundingClientRect();
  });
  cy.then(() => {
    cy.get(sourceSelector)
      .trigger("mousedown", {
        button: 0,
        force: true,
      })
      .trigger("mousemove", targetHandleRect.x - sourceHandleRect.x, 0, { force: true });
    cy.get(targetSelector).trigger("mouseup");
  });
};

describe("GuiBuilder: Pipeline Stages step", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  it("adds pipeline stages by dragging stage blocks to the pipeline editor canvas", () => {
    const model = cloneDeep(guiBuilderModel);
    const store = createStore(model);
    mountPipelineStagesWithStore(store);

    dragStageBlockToCanvas("Diff With Skeleton", { x: 250, y: 150 });
    dragStageBlockToCanvas("Compile", { x: 500, y: 150 });

    cy.then(() => {
      const { stageData: stageDataActual, stageDeps: stageDepsActual } = store.getState().config.editingConfig;

      const [diffWithSkeletonId, compileId] = Object.keys(stageDataActual);
      const diffWithSkeletonData = stageDataActual[diffWithSkeletonId];
      const compileData = stageDataActual[compileId];

      expect(diffWithSkeletonData.name).to.equal("DiffWithSkeleton");
      expect(diffWithSkeletonData.config).to.deep.equal(supportedStages.DiffWithSkeleton.defaultConfig);
      expect(compileData.name).to.equal("Compile");
      expect(compileData.config).to.deep.equal(supportedStages.Compile.defaultConfig);

      const stageDepsExpected: StageDependencyGraph = {
        [diffWithSkeletonId]: [],
        [compileId]: [],
      };
      expect(stageDepsActual).to.deep.equal(stageDepsExpected);
    });
  });

  it("updates stage dependencies when connect two stage blocks", () => {
    const model = cloneDeep(guiBuilderModel);
    const store = createStore(model);
    mountPipelineStagesWithStore(store);

    dragStageBlockToCanvas("Diff With Skeleton", { x: 250, y: 150 });
    dragStageBlockToCanvas("Compile", { x: 500, y: 150 });
    connectStageBlocks("Diff With Skeleton", "Compile");

    cy.then(() => {
      const { stageDeps: stageDepsActual } = store.getState().config.editingConfig;
      const [diffWithSkeletonId, compileId] = Object.keys(stageDepsActual);
      const stageDepsExpected: StageDependencyGraph = {
        [diffWithSkeletonId]: [],
        [compileId]: [diffWithSkeletonId],
      };
      expect(stageDepsActual).to.deep.equal(stageDepsExpected);
    });
  });

  it("shows an error icon on stages with diagnostics", () => {
    const model = getThreeStageModel();
    const store = createStore(model);
    mountPipelineStagesWithStore(store);

    store.getActions().config.parseDiagnostics([
      {
        type: "MISSING_FIELD_ERROR",
        message: "field '_settings.use_skeleton' is required but is missing. use_skeleton requires to be true",
        severity: "ERROR",
        location: { stage: "diffWithSkeleton" },
      },
    ]);

    const shouldExistErrorIcon = (label: string, exist: boolean) => {
      cy.get(`[data-label="${label}"] + [data-cy="error-icon"]`).should(exist ? "exist" : "not.exist");
    };

    shouldExistErrorIcon("Diff With Skeleton", true);
    shouldExistErrorIcon("File Structure Validation", false);
    shouldExistErrorIcon("Compile", false);
  });
});
