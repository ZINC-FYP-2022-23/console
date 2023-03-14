import Button from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { useQueryParameters, useSave } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import guiBuilderSteps from "./GuiBuilderSteps";

const SavingSpinner = <Spinner className="w-7 h-7 p-1" />;

/**
 * Button to go to the next step. It will save the current step's data before going to the next step.
 */
function NextStepButton() {
  const { updateStep } = useQueryParameters();
  const { isSaving, saveData } = useSave();

  const currentStep = useStoreState((state) => state.layout.step);
  const stageData = useStoreState((state) => state.config.editingConfig.stageData);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const nextStep = (() => {
    const stepsToShow = guiBuilderSteps.filter((step) => {
      return step.showStep === undefined || step.showStep(stageData);
    });
    const currentIdx = stepsToShow.findIndex((step) => step.slug === currentStep);
    return currentIdx === stepsToShow.length - 1 ? null : stepsToShow[currentIdx + 1].slug;
  })();

  const handleClick = async () => {
    const shouldProceedNextStep = await saveData();

    if (!shouldProceedNextStep) return;

    if (nextStep === null) {
      setModal({ path: "finishedAllSteps", value: true });
    } else {
      updateStep(nextStep);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="w-20 !text-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isSaving ? SavingSpinner : nextStep === null ? "Done" : "Next"}
    </Button>
  );
}

export default NextStepButton;
