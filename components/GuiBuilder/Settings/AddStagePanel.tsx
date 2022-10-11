import Accordion from "@components/Accordion";
import Button from "@components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@state/GuiBuilder/Hooks";
import { memo } from "react";

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
      {/* TODO: Refactor out possible stages to `constants/` folder */}
      <Accordion title="Pre-Compile" extraClassNames={{ title: "text-lg" }}>
        <div className="mt-1 flex flex-col gap-5">
          <div className="flex flex-col">
            <div
              className="px-5 py-3 self-start font-medium bg-white border border-gray-400 rounded-md hover:cursor-move"
              draggable
            >
              Diff With Skeleton
            </div>
            <p className="mt-1 text-xs text-gray-500">Compare submission against skeleton file</p>
          </div>
        </div>
      </Accordion>
      <Accordion title="Compile" extraClassNames={{ title: "text-lg" }}>
        <div>Compile</div>
      </Accordion>
      <Accordion title="Test Cases" extraClassNames={{ title: "text-lg" }}>
        <div>Test Cases</div>
      </Accordion>
      <Accordion title="Misc Stages" extraClassNames={{ title: "text-lg" }}>
        <div>Misc Stages</div>
      </Accordion>
    </div>
  );
}

export default memo(AddStagePanel);
