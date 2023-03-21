import { GuiBuilderStepSlug } from "@/components/GuiBuilder/Steps/GuiBuilderSteps";
import * as LayoutContext from "@/contexts/layout";
import * as ZincContext from "@/contexts/zinc";
import { CREATE_ASSIGNMENT_CONFIG, UPDATE_ASSIGNMENT_CONFIG } from "@/graphql/mutations/user";
import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import * as configUtils from "@/utils/GuiBuilder/config";
import { MockedResponse } from "@apollo/client/testing";
import { act } from "@testing-library/react-hooks";
import { computed, createStore } from "easy-peasy";
import mockRouter from "next-router-mock";
import useSave from "../useSave";
import renderHookWithContexts from "./utils/renderHookWithContexts";

jest.mock("next/router", () => require("next-router-mock"));

const getThreeStageModelWithStep = (data: { configId: number | null; step: GuiBuilderStepSlug }) => {
  const model = getThreeStageModel();
  model.config.configId = data.configId;
  model.layout.step = data.step;
  return model;
};

/** Dummy error for `validateAssignmentConfig`. */
const validateDummyError = JSON.stringify({ error: "dummy error" });

describe("GuiBuilder: useSave()", () => {
  describe("General Settings step", () => {
    it("shows an error notification if settings YAML fails validation", async () => {
      mockRouter.push(`/assignments/1/configs/1/gui?step=settings`);

      // @ts-ignore
      jest.spyOn(ZincContext, "useZinc").mockImplementation(() => ({
        validateAssignmentConfig: jest.fn(async () => {
          return {
            id: "1",
            configError: validateDummyError,
          };
        }),
      }));
      const useLayoutDispatchMock = jest.fn();
      jest.spyOn(LayoutContext, "useLayoutDispatch").mockImplementation(() => useLayoutDispatchMock);
      jest.spyOn(console, "error").mockImplementation(() => {});

      const model = getThreeStageModelWithStep({ configId: 1, step: "settings" });
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSave(), { store });
      const { saveData } = result.current;

      await act(async () => {
        const shouldProceedNextStep = await saveData();
        expect(shouldProceedNextStep).toBe(false);
      });

      expect(useLayoutDispatchMock).toHaveBeenCalledWith({
        type: "showNotification",
        payload: {
          success: false,
          title: "Error in General Settings",
          message: validateDummyError,
        },
      });
    });

    it("creates the config if user is creating a new config", async () => {
      mockRouter.push(`/assignments/1/configs/new/gui?step=settings`);

      // @ts-ignore
      jest.spyOn(ZincContext, "useZinc").mockImplementation(() => ({
        validateAssignmentConfig: jest.fn(async () => ({ id: "1" })),
      }));
      const settingsYamlDummy = "_settings:";
      jest.spyOn(configUtils, "configToYaml").mockReturnValue(settingsYamlDummy);

      const model = getThreeStageModelWithStep({ configId: null, step: "settings" });
      const store = createStore(model);

      const createConfigMock: MockedResponse = {
        request: {
          query: CREATE_ASSIGNMENT_CONFIG,
          variables: {
            input: {
              assignment_id: 1,
              config_yaml: settingsYamlDummy,
              configValidated: true,
              ...store.getActions().config.getPolicyAndSchedule(),
            },
          },
        },
        result: {
          data: { createAssignmentConfig: { id: 1 } },
        },
      };

      const { result } = renderHookWithContexts(() => useSave(), {
        store,
        apollo: [createConfigMock],
      });
      const { saveData } = result.current;

      await act(async () => {
        const shouldProceedNextStep = await saveData();
        expect(shouldProceedNextStep).toBe(false);
      });

      expect(store.getState().config.configId).toBe(1);
      expect(store.getState().layout.step).toBe("pipeline");
      expect(mockRouter.query.assignmentConfigId).toBe("1");
      expect(mockRouter.query.step).toBe("pipeline");
    });

    it("updates the policy and schedule if user is editing an existing config", async () => {
      mockRouter.push(`/assignments/1/configs/1/gui?step=settings`);

      // @ts-ignore
      jest.spyOn(ZincContext, "useZinc").mockImplementation(() => ({
        validateAssignmentConfig: jest.fn(async () => ({ id: "1" })),
      }));

      const model = getThreeStageModelWithStep({ configId: 1, step: "settings" });
      const store = createStore(model);

      const updateConfigMock: MockedResponse = {
        request: {
          query: UPDATE_ASSIGNMENT_CONFIG,
          variables: {
            id: 1,
            update: store.getActions().config.getPolicyAndSchedule(),
          },
        },
        result: {
          data: { updateAssignmentConfig: { id: 1 } },
        },
      };

      const { result } = renderHookWithContexts(() => useSave(), {
        store,
        apollo: [updateConfigMock],
      });
      const { saveData } = result.current;

      await act(async () => {
        const shouldProceedNextStep = await saveData();
        expect(shouldProceedNextStep).toBe(true);
      });
    });
  });

  describe("Pipeline Stages step", () => {
    beforeEach(() => {
      mockRouter.push(`/assignments/1/configs/1/gui?step=pipeline`);
    });

    it("shows an error notification if pipeline layout is invalid", async () => {
      const validateAssignmentConfigMock = jest.fn();
      // @ts-ignore
      jest.spyOn(ZincContext, "useZinc").mockImplementation(() => ({
        validateAssignmentConfig: validateAssignmentConfigMock,
      }));
      const useLayoutDispatchMock = jest.fn();
      jest.spyOn(LayoutContext, "useLayoutDispatch").mockImplementation(() => useLayoutDispatchMock);

      const model = getThreeStageModelWithStep({ configId: 1, step: "pipeline" });
      model.config.isPipelineLayoutValid = computed(() => false);
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSave(), { store });
      const { saveData } = result.current;

      await act(async () => {
        const shouldProceedNextStep = await saveData();
        expect(shouldProceedNextStep).toBe(false);
      });

      const useLayoutDispatchMockCall = useLayoutDispatchMock.mock.calls[0][0];
      expect(useLayoutDispatchMockCall.type).toBe("showNotification");
      expect(useLayoutDispatchMockCall.payload.title).toBe("Invalid Pipeline Layout");

      expect(validateAssignmentConfigMock).not.toHaveBeenCalled();
    });

    it("shows an error notification if config YAML fails validation", async () => {
      // @ts-ignore
      jest.spyOn(ZincContext, "useZinc").mockImplementation(() => ({
        validateAssignmentConfig: jest.fn(async () => {
          return {
            id: "1",
            configError: validateDummyError,
          };
        }),
      }));
      const useLayoutDispatchMock = jest.fn();
      jest.spyOn(LayoutContext, "useLayoutDispatch").mockImplementation(() => useLayoutDispatchMock);
      jest.spyOn(console, "error").mockImplementation(() => {});

      const model = getThreeStageModelWithStep({ configId: 1, step: "pipeline" });
      const store = createStore(model);

      const { result } = renderHookWithContexts(() => useSave(), { store });
      const { saveData } = result.current;

      await act(async () => {
        const shouldProceedNextStep = await saveData();
        expect(shouldProceedNextStep).toBe(false);
      });

      expect(useLayoutDispatchMock).toHaveBeenCalledWith({
        type: "showNotification",
        payload: {
          success: false,
          title: "Error in Pipeline Settings",
          message: validateDummyError,
        },
      });
    });

    it("saves the config YAML if it passes validation", async () => {
      // @ts-ignore
      jest.spyOn(ZincContext, "useZinc").mockImplementation(() => ({
        validateAssignmentConfig: jest.fn(async () => ({ id: "1" })),
      }));
      const configYamlDummy = "_settings:\ncompile:\n";
      jest.spyOn(configUtils, "configToYaml").mockReturnValue(configYamlDummy);

      const model = getThreeStageModelWithStep({ configId: 1, step: "pipeline" });
      const store = createStore(model);

      const updateConfigMock: MockedResponse = {
        request: {
          query: UPDATE_ASSIGNMENT_CONFIG,
          variables: {
            id: 1,
            update: {
              config_yaml: configYamlDummy,
            },
          },
        },
        result: {
          data: { updateAssignmentConfig: { id: 1 } },
        },
      };

      const { result } = renderHookWithContexts(() => useSave(), {
        store,
        apollo: [updateConfigMock],
      });
      const { saveData } = result.current;

      await act(async () => {
        const shouldProceedNextStep = await saveData();
        expect(shouldProceedNextStep).toBe(true);
      });
    });
  });
});