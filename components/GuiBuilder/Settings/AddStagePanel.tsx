import Accordion from "@components/Accordion";
import Button from "@components/Button";
import supportedStages, { SupportedStages } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@state/GuiBuilder/Hooks";
import { StageKind } from "@types";
import { memo } from "react";

const stagesByCategory = [
  {
    title: "Pre-Compile",
    stages: supportedStages.filter((stage) => stage.kind === StageKind.PRE_GLOBAL),
  },
  {
    title: "Compile",
    stages: supportedStages.filter((stage) => stage.kind === StageKind.PRE_LOCAL),
  },
  {
    title: "Test Cases",
    stages: supportedStages.filter((stage) => stage.kind === StageKind.GRADING),
  },
  {
    title: "Misc Stages",
    stages: supportedStages.filter((stage) => stage.kind === StageKind.POST || stage.kind === StageKind.CONSTANT),
  },
];

function StageBlock({ stage }: { stage: SupportedStages }) {
  return (
    <div className="flex flex-col">
      <div
        className="px-5 py-3 self-start font-medium bg-white border border-gray-400 rounded-md hover:cursor-move"
        draggable
      >
        {stage.label}
      </div>
      <p className="mt-1 text-xs text-gray-500">{stage.description}</p>
    </div>
  );
}

function AddStagePanel() {
  const toggleAddStage = useStoreActions((action) => action.toggleAddStage);

  return (
    <div className="flex flex-col">
      <div className="p-3 flex justify-between items-center border-b border-gray-300">
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
      {stagesByCategory.map((category) => (
        <Accordion key={category.title} title={category.title} extraClassNames={{ title: "text-lg" }}>
          <div className="mt-1 flex flex-col gap-5">
            {category.stages.map((stage) => (
              <StageBlock key={stage.name} stage={stage} />
            ))}
          </div>
        </Accordion>
      ))}
    </div>
  );
}

export default memo(AddStagePanel);
