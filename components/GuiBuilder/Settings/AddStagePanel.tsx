import Accordion from "@components/Accordion";
import Button from "@components/Button";
import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { AccordionState } from "@state/GuiBuilder/Store";
import { StageKind } from "@types";
import { memo } from "react";
import AddableStage from "../PipelineEditor/AddableStage";

type AccordionKeys = keyof AccordionState["addNewStage"];

const categoryLabel: Record<AccordionKeys, string> = {
  preCompile: "Pre-Compile",
  compile: "Compile",
  testCases: "Test Cases",
  miscStages: "Misc Stages",
};

const getCategoryByKind = (kind: StageKind): AccordionKeys => {
  switch (kind) {
    case StageKind.PRE_GLOBAL:
      return "preCompile";
    case StageKind.PRE_LOCAL:
      return "compile";
    case StageKind.GRADING:
      return "testCases";
    case StageKind.POST:
    case StageKind.CONSTANT:
      return "miscStages";
  }
};

const getStagesByCategory = () => {
  const output: Record<AccordionKeys, { [stageName: string]: SupportedStage }> = {
    preCompile: {},
    compile: {},
    testCases: {},
    miscStages: {},
  };
  Object.entries(supportedStages).forEach(([name, data]) => {
    const category = getCategoryByKind(data.kind);
    output[category][name] = data;
  });
  return output;
};

function AddStagePanel() {
  const accordion = useStoreState((state) => state.layout.accordion.addNewStage);
  const toggleAddStage = useStoreActions((action) => action.toggleAddStage);
  const setAccordion = useStoreActions((action) => action.setAccordion);
  const stagesByCategory = getStagesByCategory();

  return (
    <div className="flex flex-col">
      <div className="p-3 flex justify-between items-center sticky top-0 z-10 bg-white border-b border-gray-300">
        <h2 className="font-semibold text-xl">Add New Stage</h2>
        <Button
          className="border-green-600 text-green-600 hover:bg-green-50 active:bg-green-200"
          onClick={() => toggleAddStage()}
        >
          Finish
        </Button>
      </div>
      <div className="p-3 flex flex-col border-b border-gray-300">
        <div className="flex items-center text-sm text-blue-500">
          <FontAwesomeIcon icon={["far", "circle-question"]} className="mr-2" />
          <p>To add a new stage, drag the stage block to the canvas.</p>
        </div>
        {/* TODO: Add search bar */}
      </div>
      {Object.entries(stagesByCategory).map(([category, stages]) => (
        <Accordion
          key={category}
          title={categoryLabel[category]}
          defaultOpen={accordion[category]}
          onClick={() => {
            setAccordion({
              path: `addNewStage.${category}`,
              value: !accordion[category],
            });
          }}
          extraClassNames={{ title: "text-lg" }}
        >
          <div className="mt-1 flex flex-col gap-5">
            {Object.entries(stages).map(([name, data]) => (
              <AddableStage key={name} stageName={name} stageData={data} />
            ))}
          </div>
        </Accordion>
      ))}
    </div>
  );
}

export default memo(AddStagePanel);
