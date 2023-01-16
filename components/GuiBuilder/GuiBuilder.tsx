import { useMutation } from "@apollo/client";
import Button from "@components/Button";
import { Spinner } from "@components/Spinner";
import { useLayoutDispatch } from "@contexts/layout";
import { useZinc } from "@contexts/zinc";
import { UPDATE_ASSIGNMENT_CONFIG } from "@graphql/mutations/user";
import { Tooltip } from "@mantine/core";
import { useStoreActions, useStoreState } from "@store/GuiBuilder";
import { Assignment, AssignmentConfig } from "@types";
import { useEffect, useState } from "react";
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

type UpdateConfigVariables = { id: number; update: Partial<AssignmentConfig> };

function GUIAssignmentBuilder({ data, configId }: GUIAssignmentBuilderProps) {
  const { validateAssignmentConfig } = useZinc();
  const dispatch = useLayoutDispatch();

  const isEdited = useStoreState((state) => state.config.isEdited);
  const step = useStoreState((state) => state.layout.step);
  const initializeAssignment = useStoreActions((actions) => actions.config.initializeAssignment);
  const getConfigsToSave = useStoreActions((actions) => actions.config.getConfigsToSave);
  const setInitConfigsToEditing = useStoreActions((actions) => actions.config.setInitConfigsToEditing);

  const [updateConfig] = useMutation<any, UpdateConfigVariables>(UPDATE_ASSIGNMENT_CONFIG);

  const [isSaving, setIsSaving] = useState(false);

  // Initialize store
  useEffect(() => {
    initializeAssignment({
      configId,
      courseId: data?.assignment.course.id ?? null,
      config: data?.assignmentConfig ?? null,
    });
  }, [data, configId, initializeAssignment]);

  const isNewAssignment = configId === null;
  const disableSave = !isNewAssignment && !isEdited;
  const StepComponent = guiBuilderSteps[step].component;

  const saveConfig = async () => {
    setIsSaving(true);

    // TODO(Anson): Validate pipeline graph first (e.g. make sure it's a linked list)

    const configsToSave = getConfigsToSave();
    try {
      const { configError } = await validateAssignmentConfig(
        configsToSave.config_yaml,
        configId?.toString() ?? "draft",
      );
      if (configError) {
        const configErrorJson = JSON.parse(configError);
        console.error("Error while validating config", configErrorJson);

        // TODO(Anson): Parse the config error and display it in UI

        dispatch({
          type: "showNotification",
          payload: {
            success: false,
            title: "Config Error",
            message: "There is an error in the assignment config.",
          },
        });
        setIsSaving(false);
        return;
      }

      if (isNewAssignment) {
        // TODO(Anson): Create new assignment
      } else {
        await updateConfig({
          variables: { id: configId, update: configsToSave },
        });
        dispatch({
          type: "showNotification",
          payload: {
            success: true,
            title: "Assignment Config Updated",
            message: "Changes to the assignment config has been saved",
          },
        });
      }
      setInitConfigsToEditing();
    } catch (error: any) {
      console.error(error);
      dispatch({
        type: "showNotification",
        payload: { success: false, title: "Save failed", message: error.message },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 w-full flex flex-col gap-5">
      <div className="flex items-center">
        <Stepper className="flex-1" />
        <Tooltip label="You didn't make any changes" disabled={!disableSave} position="bottom-end">
          <div className="ml-8">
            <Button
              onClick={() => saveConfig()}
              disabled={disableSave}
              className="w-20 !text-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? SaveButtonSpinner : isNewAssignment ? "Create" : "Save"}
            </Button>
          </div>
        </Tooltip>
      </div>
      <div className="flex-1 overflow-y-hidden">
        <StepComponent />
      </div>
    </div>
  );
}

const SaveButtonSpinner = <Spinner className="w-7 h-7 p-1" />;

export default GUIAssignmentBuilder;
