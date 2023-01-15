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
  /** The `assignmentConfigId`. It's `null` when creating a new assignment. */
  configId: number | null;
}

function GUIAssignmentBuilder({ data, configId }: GUIAssignmentBuilderProps) {
  const isNewAssignment = configId === null;

  const isEdited = useStoreState((state) => state.config.isEdited);
  const step = useStoreState((state) => state.layout.step);
  const initializeAssignment = useStoreActions((actions) => actions.config.initializeAssignment);

  // Initialize store
  useEffect(() => {
    initializeAssignment({
      configId,
      courseId: data?.assignment.course.id ?? null,
      config: data?.assignmentConfig ?? null,
    });
  }, [data, configId, initializeAssignment]);

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
