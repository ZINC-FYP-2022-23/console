import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { useStoreState } from "@state/GuiBuilder/Hooks";

/**
 * Settings panel for an individual stage in the pipeline.
 */
function StageSettings() {
  const selectedStage = useStoreState((state) => state.selectedStage);

  if (selectedStage === null) {
    return <NoStageSelected />;
  }

  const supportedStage: SupportedStage = supportedStages[selectedStage.name];
  const StageSettings = supportedStage.stageSettings;

  return (
    <div className="w-full">
      <div className="p-3 flex justify-between border-b border-gray-300">
        <div className="flex self-center">
          <h2 className="text-xl font-semibold">{supportedStage.label}</h2>
          <Tooltip
            label={supportedStage.description}
            transition="fade"
            position="right"
            withArrow
            className="ml-2 p-1 flex self-center text-gray-500"
          >
            <FontAwesomeIcon icon={["far", "circle-info"]} />
          </Tooltip>
        </div>
      </div>
      <StageSettings />
    </div>
  );
}

function NoStageSelected() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="space-y-3 text-center">
        <p className="text-lg font-medium">Select a stage in the pipeline editor to configure its settings.</p>
        <p>(TODO: Refine the UI of this panel)</p>
      </div>
    </div>
  );
}

export default StageSettings;
