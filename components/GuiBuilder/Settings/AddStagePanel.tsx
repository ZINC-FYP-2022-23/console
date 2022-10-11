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
          className="border-cse-700 text-cse-700 hover:bg-blue-50 active:bg-blue-200"
          onClick={() => toggleAddStage()}
        >
          Finish
        </Button>
      </div>
      <div className="p-3 flex flex-col">
        <div className="flex items-center text-sm text-blue-500">
          <FontAwesomeIcon icon={["far", "circle-question"]} className="mr-2" />
          <p>To add a new stage, drag the stage block to the canvas.</p>
        </div>
      </div>
    </div>
  );
}

export default memo(AddStagePanel);
