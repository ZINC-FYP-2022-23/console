import { useLayoutDispatch } from "@/contexts/layout";
import { useZinc } from "@/contexts/zinc";
import { CREATE_ASSIGNMENT_CONFIG, UPDATE_ASSIGNMENT_CONFIG } from "@/graphql/mutations/user";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { AssignmentConfig } from "@/types/tables";
import { configToYaml } from "@/utils/GuiBuilder";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";

type CreateConfigVariables = { input: Partial<AssignmentConfig> };
type CreateConfigReturnType = { createAssignmentConfig: { id: number } };
type UpdateConfigVariables = { id: number; update: Partial<AssignmentConfig> };

/**
 * A hook for handling the saving logic of the GUI Assignment Builder.
 */
function useSave() {
  const dispatch = useLayoutDispatch();
  const router = useRouter();
  const { validateAssignmentConfig } = useZinc();

  const currentStep = useStoreState((state) => state.layout.step);
  const configId = useStoreState((state) => state.config.configId);
  const isEdited = useStoreState((state) => state.config.isEdited);
  const duplicatedStageLabel = useStoreState((state) => state.config.duplicatedStageLabel);
  const isPipelineLayoutValid = useStoreState((state) => state.config.isPipelineLayoutValid);

  const generateStageLabels = useStoreActions((actions) => actions.config.generateStageLabels);
  const getEditingConfig = useStoreActions((actions) => actions.config.getEditingConfig);
  const getPolicyAndSchedule = useStoreActions((actions) => actions.config.getPolicyAndSchedule);
  const setConfigId = useStoreActions((actions) => actions.config.setConfigId);
  const setInitConfigsToEditing = useStoreActions((actions) => actions.config.setInitConfigsToEditing);
  const setStep = useStoreActions((actions) => actions.layout.setStep);

  const [createConfig] = useMutation<CreateConfigReturnType, CreateConfigVariables>(CREATE_ASSIGNMENT_CONFIG);
  const [updateConfig] = useMutation<{ id: number }, UpdateConfigVariables>(UPDATE_ASSIGNMENT_CONFIG);

  const [isSaving, setIsSaving] = useState(false);

  const assignmentId = parseInt(router.query.assignmentId as string, 10);
  const isNewAssignment = configId === null;

  /**
   * Save handler for the "General Settings" step.
   *
   * It will create a new assignment config if current config ID is null. This ensures the subsequent steps
   * have a non-null config ID.
   *
   * @returns Whether the page should proceed to next step.
   */
  const saveGeneralSettings = async (): Promise<boolean> => {
    // Validate `_settings` part of YAML first
    const editingConfig = getEditingConfig();
    const settingsYaml = configToYaml(editingConfig, true);
    const { configError } = await validateAssignmentConfig(settingsYaml, configId?.toString() ?? "draft");
    if (configError) {
      const configErrorJson = JSON.parse(configError);
      console.error("Error while validating config", configErrorJson);

      // TODO(Anson): Parse the config error and display it in UI

      dispatch({
        type: "showNotification",
        payload: {
          success: false,
          title: "Error in General Settings",
          // TODO(Anson): Show proper error message instead of the raw JSON
          message: configError,
        },
      });
      return false;
    }

    if (isNewAssignment) {
      // Create new assignment to ensure that subsequent steps have a non-null config ID
      const { data } = await createConfig({
        variables: {
          input: {
            assignment_id: assignmentId,
            config_yaml: settingsYaml, // Store the `_settings` part of YAML first
            configValidated: true,
            ...getPolicyAndSchedule(),
          },
        },
      });
      if (data) {
        const newConfigId = data.createAssignmentConfig.id;
        setConfigId(newConfigId);
        setStep("pipeline");
        await router.push(`/assignments/${assignmentId}/configs/${newConfigId}/gui?step=pipeline`, undefined, {
          shallow: true,
        });
        return false; // since `router.push()` already proceeds to next step
      }
    } else {
      // Update existing assignment's policy and schedule
      await updateConfig({
        variables: {
          id: configId,
          update: getPolicyAndSchedule(),
        },
      });
      if (isEdited.policy || isEdited.schedule) {
        dispatch({
          type: "showNotification",
          payload: {
            success: true,
            title: "General Settings Updated",
            message: "Changes to the assignment policy and schedule have been saved",
          },
        });
      }
    }

    setInitConfigsToEditing();
    return true;
  };

  /**
   * Save handler for the "Pipeline Stages" step.
   * @returns Whether the page should proceed to next step.
   */
  const savePipelineStages = async (): Promise<boolean> => {
    // Validate pipeline layout
    if (!isPipelineLayoutValid) {
      dispatch({
        type: "showNotification",
        payload: {
          success: false,
          title: "Invalid Pipeline Layout",
          message: "Please fix the grading pipeline layout.",
        },
      });
      return false;
    }
    // Validate duplicated non-empty stage labels for the same stage name
    if (duplicatedStageLabel) {
      dispatch({
        type: "showNotification",
        payload: {
          success: false,
          title: "Duplicated Stage Labels",
          message: `You cannot use the same stage label ("${duplicatedStageLabel.label}") in two ${duplicatedStageLabel.name} stages.`,
        },
      });
      return false;
    }

    // `configId` should not be null as this point. This is simply a safety check
    if (configId === null) {
      throw new Error("Failed to get this config's ID. Please refresh the page and try again.");
    }

    // Validate config YAML first
    const editingConfig = generateStageLabels();
    const configYaml = configToYaml(editingConfig);
    const { configError } = await validateAssignmentConfig(configYaml, configId.toString());
    if (configError) {
      const configErrorJson = JSON.parse(configError);
      console.error("Error while validating config", configErrorJson);

      // TODO(Anson): Parse the config error and display it in UI

      dispatch({
        type: "showNotification",
        payload: {
          success: false,
          title: "Error in Pipeline Settings",
          // TODO(Anson): Show proper error message instead of the raw JSON
          message: configError,
        },
      });
      return false;
    }

    // Update config YAML
    await updateConfig({
      variables: {
        id: configId,
        update: {
          config_yaml: configToYaml(editingConfig),
        },
      },
    });
    if (isEdited.config) {
      dispatch({
        type: "showNotification",
        payload: {
          success: true,
          title: "Pipeline Stages Updated",
          message: "Changes to the pipeline stages have been saved",
        },
      });
    }

    setInitConfigsToEditing();
    return true;
  };

  /**
   * @returns Whether the page should proceed to next step after saving.
   */
  const saveData = async (): Promise<boolean> => {
    if (isSaving) return false;

    setIsSaving(true);

    try {
      switch (currentStep) {
        case "settings":
          return await saveGeneralSettings();
        case "pipeline":
          return await savePipelineStages();
        default:
          return true;
      }
    } catch (error: any) {
      console.error(error);
      dispatch({
        type: "showNotification",
        payload: { success: false, title: "Error occurred while saving your progress", message: error.message },
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    /** Whether saving is in progress. */
    isSaving,
    /**
     * A callback for saving the appropriate data to the database according to which step the user is in.
     *
     * Other side effects (e.g. validate config YAML, create new assignment config) are also performed when necessary.
     *
     * @returns Whether the page should proceed to next step after saving.
     */
    saveData,
  };
}

export default useSave;
