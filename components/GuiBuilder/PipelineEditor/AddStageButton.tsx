import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { memo } from "react";

function AddStageButton() {
  const showAddStage = useStoreState((state) => state.layout.showAddStage);
  const toggleAddStage = useStoreActions((action) => action.toggleAddStage);

  return (
    <div className="absolute right-3 top-3 z-10">
      <Tooltip
        label={showAddStage ? "Finish Add Stage" : "Add stage"}
        position="bottom"
        transition="fade"
        transitionDuration={200}
      >
        <button
          className={`h-11 w-11 flex items-center justify-center text-white rounded-full drop-shadow ${
            showAddStage ? "bg-green-600" : "bg-cse-700"
          }`}
          onClick={() => toggleAddStage()}
        >
          <FontAwesomeIcon icon={["fas", showAddStage ? "check" : "plus"]} className="text-xl" />
        </button>
      </Tooltip>
    </div>
  );
}

export default memo(AddStageButton);
