import { GuiBuilderModel } from "@/store/GuiBuilder";
import { getThreeStageModel } from "@/store/GuiBuilder/__tests__/utils/storeTestUtils";
import { StageKind, StdioTest } from "@/types/GuiBuilder";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Store, StoreProvider } from "easy-peasy";
import Stepper from "../Stepper";

const useQueryParameters = jest.requireActual("@/hooks/GuiBuilder/useQueryParameters.ts");

const renderStepper = (store: Store<GuiBuilderModel>) =>
  render(
    <StoreProvider store={store}>
      <Stepper />
    </StoreProvider>,
  );

describe("GuiBuilder: <Stepper />", () => {
  describe("Base scenario", () => {
    const expectedStepLabels = [
      "General Settings",
      "Pipeline Stages",
      "Upload Files",
      "Test Submission",
      "Assign Students",
    ];

    it("renders the steps correctly", () => {
      const model = getThreeStageModel();
      const store = createStore(model);

      const { getAllByRole } = renderStepper(store);

      const allButtons = getAllByRole("button");
      expect(allButtons).toHaveLength(expectedStepLabels.length);
      expectedStepLabels.forEach((label, index) => {
        expect(allButtons[index]).toHaveTextContent(label);
      });
    });

    it("only allows previous steps to be clickable", async () => {
      const updateStepMock = jest.fn();
      jest.spyOn(useQueryParameters, "default").mockReturnValue({
        updateStep: updateStepMock,
      });

      const model = getThreeStageModel();
      model.layout.step = "pipeline";
      const store = createStore(model);

      const { getByRole } = renderStepper(store);

      // Current step is unclickable
      const pipelineStages = getByRole("button", { name: expectedStepLabels[1] });
      await userEvent.click(pipelineStages);
      expect(updateStepMock).not.toHaveBeenCalled();

      // Future step is unclickable
      const uploadFiles = getByRole("button", { name: expectedStepLabels[2] });
      await userEvent.click(uploadFiles);
      expect(updateStepMock).not.toHaveBeenCalled();

      // Previous step is clickable
      const generalSettings = getByRole("button", { name: expectedStepLabels[0] });
      await userEvent.click(generalSettings);
      expect(updateStepMock).toHaveBeenCalledWith("settings");
    });
  });

  describe("Auto-generate expected output of test cases", () => {
    const expectedStepLabels = [
      "General Settings",
      "Pipeline Stages",
      "Upload Files",
      "Generate Output",
      "Test Submission",
      "Assign Students",
    ];

    it("renders the additional Generate Output step", async () => {
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
      model.layout.step = "assign";
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

      const { getByRole, getAllByRole } = renderStepper(store);

      // Render all steps correctly
      const allButtons = getAllByRole("button");
      expect(allButtons).toHaveLength(expectedStepLabels.length);
      expectedStepLabels.forEach((label, index) => {
        expect(allButtons[index]).toHaveTextContent(label);
      });

      // Click on Generate Output step
      const generateOutput = getByRole("button", { name: expectedStepLabels[3] });
      await userEvent.click(generateOutput);
      expect(updateStepMock).toHaveBeenCalledWith("generate-output");
    });
  });
});
