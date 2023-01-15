import Button from "@components/Button";
import { useStoreActions, useStoreState } from "@store/GuiBuilder";
import { Assignment, AssignmentConfig } from "@types";
import { useEffect } from "react";
import guiBuilderSteps from "./Steps/GuiBuilderSteps";
import Stepper from "./Steps/Stepper";

interface GUIAssignmentBuilderProps {
  /** Config data queried from GraphQL. */
  data?: {
    /** @remarks It's `null` when creating a new assignment. */
    assignmentConfig: AssignmentConfig | null;
    assignment: Assignment;
  };
  /** The `assignmentConfigId`. It's `-1` when creating a new assignment. */
  configId: number;
}

function GUIAssignmentBuilder({ data, configId }: GUIAssignmentBuilderProps) {
  const isNewAssignment = configId === -1;

  const isEdited = useStoreState((state) => state.config.isEdited);
  const step = useStoreState((state) => state.layout.step);
  const setCourseId = useStoreActions((actions) => actions.config.setCourseId);
  const initializeConfig = useStoreActions((actions) => actions.config.initializeConfig);
  const initializePolicy = useStoreActions((actions) => actions.config.initializePolicy);
  const initializeSchedule = useStoreActions((actions) => actions.config.initializeSchedule);
  const initializePipeline = useStoreActions((actions) => actions.pipelineEditor.initializePipeline);

  // Initialize store
  useEffect(() => {
    if (data?.assignment) {
      setCourseId(data.assignment.course.id);
    }
    // From existing assignment
    if (data?.assignmentConfig) {
      initializeConfig({ id: configId, configYaml: data.assignmentConfig.config_yaml });
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
      initializePipeline();
    }
  }, [data, configId, setCourseId, initializeConfig, initializePolicy, initializeSchedule, initializePipeline]);

  const StepComponent = guiBuilderSteps[step].component;

  return (
    <div className="p-4 w-full flex flex-col gap-5">
      <div className="flex items-center">
        <Stepper className="flex-1" />
        <Button
          className="ml-8 !text-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!isNewAssignment && !isEdited}
          onClick={() => {
            // TODO
          }}
        >
          {isNewAssignment ? "Create" : "Save"}
        </Button>
      </div>
      <div className="flex-1 overflow-y-hidden">
        <StepComponent />
      </div>
    </div>
  );
}

export default GUIAssignmentBuilder;
