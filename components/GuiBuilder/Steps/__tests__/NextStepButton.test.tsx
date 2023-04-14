import { GuiBuilderModel } from "@/store/GuiBuilder";
import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { StageKind, StdioTest } from "@/types/GuiBuilder";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Store, StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import NextStepButton from "../NextStepButton";

const useSave = jest.requireActual("@/hooks/GuiBuilder/useSave.ts");
const useQueryParameters = jest.requireActual("@/hooks/GuiBuilder/useQueryParameters.ts");

const renderNextStepButton = (store: Store<GuiBuilderModel>) =>
  render(
    <StoreProvider store={store}>
      <NextStepButton />
    </StoreProvider>,
  );

describe("GuiBuilder: <NextStepButton />", () => {
  it("should not proceed next step if save data failed", async () => {
    jest.spyOn(useSave, "default").mockReturnValue({
      isSaving: false,
      saveData: jest.fn().mockResolvedValue(false),
    });

    const model = getThreeStageModel();
    model.layout.step = "settings";
    const store = createStore(model);

    const { getByText } = renderNextStepButton(store);
    await userEvent.click(getByText("Next"));

    await waitFor(() => {
      expect(store.getState().layout.step).toBe("settings");
    });
  });

  describe("when successfully save data", () => {
    beforeAll(() => {
      jest.spyOn(useSave, "default").mockReturnValue({
        isSaving: false,
        saveData: jest.fn().mockResolvedValue(true),
      });
    });

    it("proceeds to the next step", async () => {
      const updateStepMock = jest.fn();
      jest.spyOn(useQueryParameters, "default").mockReturnValue({
        updateStep: updateStepMock,
      });

      const model = getThreeStageModel();
      model.layout.step = "upload";
      const store = createStore(model);

      const { getByText } = renderNextStepButton(store);

      // Upload Files -> Test Submission
      await userEvent.click(getByText("Next"));
      await waitFor(() => {
        expect(updateStepMock).toBeCalledWith("test");
      });

      act(() => {
        store.getActions().layout.setStep("test");
      });

      // Test Submission -> Assign Students
      await userEvent.click(getByText("Next"));
      await waitFor(() => {
        expect(updateStepMock).toBeCalledWith("assign");
      });
    });

    it("opens the Finished All Steps modal when at the last step", async () => {
      const updateStepMock = jest.fn();
      jest.spyOn(useQueryParameters, "default").mockReturnValue({
        updateStep: updateStepMock,
      });

      const model = getThreeStageModel();
      model.layout.step = "assign";
      const store = createStore(model);

      const { getByText } = renderNextStepButton(store);
      await userEvent.click(getByText("Done"));

      await waitFor(() => {
        expect(store.getState().layout.modal.finishedAllSteps).toBe(true);
        expect(updateStepMock).not.toHaveBeenCalled();
      });
    });

    it("handles auto-generate expected output of test cases", async () => {
      const updateStepMock = jest.fn();
      jest.spyOn(useQueryParameters, "default").mockReturnValue({
        updateStep: updateStepMock,
      });

      const stdioTestConfig: StdioTest = {
        testCases: [],
        diff_ignore_flags: [],
        additional_packages: [],
        additional_pip_packages: [],
        experimentalModularize: true,
        generate_expected_output: true,
      };
      const model = getThreeStageModel();
      model.layout.step = "upload";
      model.config.editingConfig.stageData = {
        ...model.config.editingConfig.stageData,
        "stage-3": {
          name: "StdioTest",
          label: "",
          kind: StageKind.GRADING,
          config: stdioTestConfig,
        },
      };
      const store = createStore(model);

      const { getByText } = renderNextStepButton(store);

      // Upload Files -> Generate Output
      await userEvent.click(getByText("Next"));
      await waitFor(() => {
        expect(updateStepMock).toBeCalledWith("generate-output");
      });

      act(() => {
        store.getActions().layout.setStep("generate-output");
      });

      // Generate Output -> Test Submission
      await userEvent.click(getByText("Next"));
      await waitFor(() => {
        expect(updateStepMock).toBeCalledWith("test");
      });
    });
  });
});
