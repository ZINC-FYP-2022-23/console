import { useLayoutDispatch } from "@/contexts/layout";
import { useZinc } from "@/contexts/zinc";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "../Button";
import { SwitchGroup } from "../Input";

/**
 * The modal to show after the user has finished all steps in the GUI Assignment Builder.
 */
function FinishedAllStepsModal() {
  const theme = useMantineTheme();
  const dispatch = useLayoutDispatch();
  const router = useRouter();
  const { triggerManualGrading } = useZinc();

  const configId = useStoreState((state) => state.config.configId);
  const isModalOpened = useStoreState((state) => state.layout.modal.finishedAllSteps);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const [shouldRegrade, setShouldRegrade] = useState(false);

  /**
   * Closes the modal and triggers regrading (if any).
   * @param redirectUrl Optional URL to redirect to another page after closing the modal.
   */
  const closeModal = async (redirectUrl?: string) => {
    setModal({ path: "finishedAllSteps", value: false });

    if (!shouldRegrade) {
      redirectUrl && router.push(redirectUrl);
      return;
    }

    try {
      if (configId === null) {
        throw new Error("Failed to retrieve the config ID.");
      }
      await triggerManualGrading(configId.toString());
      dispatch({
        type: "showNotification",
        payload: {
          title: "Regrading scheduled successfully",
          message: "New regrading reports should appear momentarily",
          success: true,
        },
      });
    } catch (error: any) {
      console.error("Trigger regrading failed", error);
      dispatch({
        type: "showNotification",
        payload: { title: "Regrading trigger failed", message: error.message, success: false },
      });
    } finally {
      redirectUrl && router.push(redirectUrl);
    }
  };

  return (
    <Modal
      opened={isModalOpened}
      onClose={closeModal}
      closeOnClickOutside={true}
      centered
      overlayColor={theme.colors.gray[7]}
      size="auto"
      withCloseButton={false}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="px-5 flex flex-col items-center gap-3">
          <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-green-100">
            <FontAwesomeIcon icon={["fas", "check"]} className="text-lg text-green-600" />
          </div>
          <p className="font-medium text-center text-lg">Assignment config saved successfully</p>
          <div className="text-sm">
            <p className="text-center text-gray-500">You have finished all steps to configure an assignment.</p>
          </div>
        </div>
        <div className="px-5 flex flex-col items-center gap-3">
          <div className="text-gray-900">
            <SwitchGroup
              checked={shouldRegrade}
              label="Trigger regrading for students assigned to this config"
              onChange={() => setShouldRegrade(!shouldRegrade)}
            />
          </div>
          <Link href={`/api/download/configs/${configId}`}>
            <a className="mt-1 px-4 py-1 flex items-center justify-center border border-cse-600 font-medium rounded-md text-cse-700 transition ease-in-out duration-150 hover:bg-blue-100">
              <FontAwesomeIcon icon={["far", "file-export"]} className="mr-3" />
              <span>Export Config as YAML</span>
            </a>
          </Link>
        </div>
        <div className="w-full mt-2 flex flex-col gap-2">
          <Button onClick={() => closeModal("/assignments")} className="bg-cse-600 text-white hover:bg-cse-700">
            Back to Assignments Page
          </Button>
          <Button onClick={() => closeModal()} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
            Continue Editing
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default FinishedAllStepsModal;
