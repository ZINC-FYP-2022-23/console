import Button from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { useQueryParameters, useSave } from "@/hooks/GuiBuilder";
import { useStoreState } from "@/store/GuiBuilder";
import { getNextStepSlug } from "@/utils/GuiBuilder";

const SavingSpinner = <Spinner className="w-7 h-7 p-1" />;

/**
 * Button to go to the next step. It will save the current step's data before going to the next step.
 */
function NextStepButton() {
  const { updateStep } = useQueryParameters();
  const { isSaving, saveData } = useSave();

  const currentStep = useStoreState((state) => state.layout.step);

  const nextStep = getNextStepSlug(currentStep);

  const handleClick = async () => {
    const shouldProceedNextStep = await saveData();

    if (!shouldProceedNextStep) return;

    if (nextStep === null) {
      // TODO(Anson): Show dialog to inform that the assignment set-up has been completed
      // We can ask if the user wishes to regrade assignments if the config has been updated, or simply show
      // a button to regrade all assignments
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
