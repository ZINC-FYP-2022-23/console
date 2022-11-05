import supportedStages, { SupportedStage } from "@constants/Config/supportedStages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mantine/core";
import { useStoreState } from "@state/GuiBuilder/Hooks";
import Image from "next/image";
import UnsupportedStage from "./UnsupportedStage";

/**
 * Settings panel for an individual stage in the pipeline.
 */
function StageSettings() {
  const selectedStage = useStoreState((state) => state.selectedStage);

  if (selectedStage === null) {
    return <NoStageSelected />;
  }

  const stageName = selectedStage.name;
  const supportedStage: SupportedStage | undefined = supportedStages[stageName];
  const StageSettings = supportedStage?.stageSettings ?? UnsupportedStage;

  return (
    <div className="w-full">
      <div className="p-3 flex justify-between border-b border-gray-300">
        <div className="flex self-center">
          <h2 className="text-xl font-semibold">{supportedStage?.label ?? stageName}</h2>
          {supportedStage && (
            <Tooltip
              label={supportedStage.description}
              transition="fade"
              position="right"
              withArrow
              className="ml-2 p-1 flex self-center text-gray-500"
            >
              <FontAwesomeIcon icon={["far", "circle-info"]} />
            </Tooltip>
          )}
        </div>
      </div>
      <StageSettings />
    </div>
  );
}

function NoStageSelected() {
  return (
    <div className="h-full px-5 flex flex-col gap-6 items-center justify-center">
      <div className="flex items-center gap-3 text-lg text-blue-500">
        <FontAwesomeIcon icon={["far", "circle-question"]} />
        <p className="font-medium">To configure a stage, click the stage block in the pipeline editor.</p>
      </div>
      <div className="overflow-hidden">
        <Image
          src="/assets/gui_editor_select_stage.svg"
          alt="pipeline editor demo"
          width={300}
          height={150}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

export default StageSettings;
