import Accordion from "@components/Accordion";
import Button from "@components/Button";
import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@state/GuiBuilder/Hooks";
import { StageKind } from "@types";
import { memo } from "react";
import AddableStage from "../PipelineEditor/AddableStage";

const getCategoryByKind = (kind: StageKind) => {
  switch (kind) {
    case StageKind.PRE_GLOBAL:
      return "Pre-Compile";
    case StageKind.PRE_LOCAL:
      return "Compile";
    case StageKind.GRADING:
      return "Test Cases";
    case StageKind.POST:
    case StageKind.CONSTANT:
      return "Misc Stages";
  }
};

const getStagesByCategory = () => {
  const output: Record<string, { [stageName: string]: SupportedStage }> = {
    "Pre-Compile": {},
    Compile: {},
    "Test Cases": {},
    "Misc Stages": {},
  };
  Object.entries(supportedStages).forEach(([name, data]) => {
    const category = getCategoryByKind(data.kind);
    output[category][name] = data;
  });
  return output;
};

function AddStagePanel() {
  const toggleAddStage = useStoreActions((action) => action.toggleAddStage);
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
        <Accordion key={category} title={category} extraClassNames={{ title: "text-lg" }}>
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
