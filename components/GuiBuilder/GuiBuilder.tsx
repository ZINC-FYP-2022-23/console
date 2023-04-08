import { useHighlightElement, useQueryParameters, useWarnUnsavedChanges } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Assignment, AssignmentConfig } from "@/types/tables";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import { useEffect, useState } from "react";
import FinishedAllStepsModal from "./FinishedAllStepsModal";
import InitializationError from "./InitializationError";
import guiBuilderSteps from "./Steps/GuiBuilderSteps";
import NextStepButton from "./Steps/NextStepButton";
import Stepper from "./Steps/Stepper";

interface GUIAssignmentBuilderProps {
  /** Config data queried from GraphQL. */
  data?: {
    /** It's `null` when creating a new assignment. */
    assignmentConfig: AssignmentConfig | null;
    assignment: Assignment;
  };
  /** The `assignmentConfigId`. It's `null` when creating a new assignment. */
  configId: number | null;
}

function GUIAssignmentBuilder({ data, configId: configIdProp }: GUIAssignmentBuilderProps) {
  const stepIndex = useStoreState((state) => state.layout.stepIndex);
  const initializeAssignment = useStoreActions((actions) => actions.config.initializeAssignment);

  const [initializeError, setInitializeError] = useState<Error | null>(null);

  useHighlightElement();
  useWarnUnsavedChanges();

  // Initialize store
  useEffect(() => {
    try {
      initializeAssignment({
        configId: configIdProp,
        courseId: data?.assignment.course.id ?? null,
        config: data?.assignmentConfig ?? null,
      });
    } catch (err) {
      setInitializeError(err as Error);
    }
  }, [data, configIdProp, initializeAssignment]);

  const { initializeStateFromQueryParams } = useQueryParameters();
  initializeStateFromQueryParams();

  if (initializeError) return <InitializationError error={initializeError} />;

  const StepComponent = guiBuilderSteps[stepIndex].component;

  return (
    <div className="p-4 w-full flex flex-col gap-5">
      <div className="flex items-center">
        <Stepper className="flex-1" />
        <div className="ml-6">
          <NextStepButton />
        </div>
      </div>
      <div className="flex-1 overflow-y-hidden">
        <StepComponent />
      </div>
      <FinishedAllStepsModal />
    </div>
  );
}

export default GUIAssignmentBuilder;
