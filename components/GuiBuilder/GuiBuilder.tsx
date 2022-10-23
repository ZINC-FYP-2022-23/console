import Button from "@components/Button";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { AssignmentConfig } from "@types";
import { configToYaml, parseConfigYaml } from "@utils/Config";
import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import PipelineEditor from "./PipelineEditor/PipelineEditor";
import AddStagePanel from "./Settings/AddStagePanel";
import SettingsPanel from "./Settings/SettingsPanel";

interface GUIAssignmentBuilderProps {
  /**
   * Config data queried from GraphQL if the assignment already exists. It's `undefined` when
   * creating a new assignment.
   */
  data?: {
    assignmentConfig: AssignmentConfig;
  };
  /** The `assignmentConfigId`. It's `null` when creating a new assignment. */
  configId: number | null;
}

function GUIAssignmentBuilder({ data, configId }: GUIAssignmentBuilderProps) {
  const isNewAssignment = configId === null;

  const editingConfig = useStoreState((state) => state.editingConfig);
  const isEdited = useStoreState((state) => state.isEdited);
  const showAddStage = useStoreState((state) => state.layout.showAddStage);
  const initializeConfig = useStoreActions((actions) => actions.initializeConfig);
  const initializePolicy = useStoreActions((actions) => actions.initializePolicy);
  const initializeSchedule = useStoreActions((actions) => actions.initializeSchedule);

  // Initialize store
  useEffect(() => {
    if (data) {
      const config = parseConfigYaml(data.assignmentConfig.config_yaml);
      initializeConfig({ config, id: configId });
      initializePolicy({
        attemptLimits: data.assignmentConfig.attemptLimits ?? null,
        gradeImmediately: data.assignmentConfig.gradeImmediately,
        showImmediateScores: data.assignmentConfig.showImmediateScores,
      });
      initializeSchedule({
        showAt: data.assignmentConfig.showAt ?? "",
        startCollectionAt: data.assignmentConfig.startCollectionAt ?? "",
        dueAt: data.assignmentConfig.dueAt,
        stopCollectionAt: data.assignmentConfig.stopCollectionAt,
        releaseGradeAt: data.assignmentConfig.releaseGradeAt ?? "",
      });
    }
  }, [data, configId, initializeConfig, initializePolicy, initializeSchedule]);

  return (
    <div className="p-4 pl-3 w-full flex flex-col">
      <div className="ml-1 mb-2 flex items-center justify-between">
        <h1 className="font-bold text-gray-900 text-xl sm:text-2xl">
          {isNewAssignment ? "New Assignment Config" : `Editing Assignment Config #${configId}`}
        </h1>
        <div className="flex gap-2">
          <Button className="bg-violet-500 text-white hover:bg-violet-600" onClick={() => console.log(editingConfig)}>
            Debug: Log Config
          </Button>
          <Button
            className="bg-violet-500 text-white hover:bg-violet-600"
            onClick={() => console.log(configToYaml(editingConfig))}
          >
            Debug: Log YAML
          </Button>
          <Button
            className="bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isNewAssignment && !isEdited}
            onClick={() => {
              // TODO
            }}
          >
            {isNewAssignment ? "Create" : "Save"}
          </Button>
        </div>
      </div>
      <div className="pt-1 pl-1 flex-1 flex flex-row gap-3 overflow-y-hidden">
        <div className="w-4/6 flex flex-col gap-3">
          <div className="h-1/2">
            <ReactFlowProvider>
              <PipelineEditor />
            </ReactFlowProvider>
          </div>
          <div className="h-1/2 bg-white rounded-md shadow">Stage settings</div>
        </div>
        <div className="w-2/6 bg-white rounded-md shadow overflow-y-auto">
          {showAddStage ? <AddStagePanel /> : <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

export default GUIAssignmentBuilder;
