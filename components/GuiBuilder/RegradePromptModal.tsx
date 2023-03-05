import { useLayoutDispatch } from "@/contexts/layout";
import { useZinc } from "@/contexts/zinc";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, useMantineTheme } from "@mantine/core";
import Button from "../Button";

/**
 * A modal that prompts the user to trigger regrading.
 */
function RegradePromptModal() {
  const theme = useMantineTheme();
  const dispatch = useLayoutDispatch();
  const { triggerManualGrading } = useZinc();

  const configId = useStoreState((state) => state.config.configId);
  const isModalOpened = useStoreState((state) => state.layout.modal.regradePrompt);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const closeModal = () => setModal({ path: "regradePrompt", value: false });

  const triggerRegrade = async () => {
    closeModal();
    if (configId === null) {
      console.error("configId is null while triggering regrade.");
      return;
    }
    try {
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
    }
  };

  return (
    <Modal
      opened={isModalOpened}
      onClose={closeModal}
      centered
      overlayColor={theme.colors.gray[7]}
      withCloseButton={false}
      size={500}
    >
      <div className="px-2 flex items-start gap-6">
        <div className="p-3 flex items-center justify-center bg-green-100 rounded-full">
          <FontAwesomeIcon icon={["fas", "check"]} className="text-lg text-green-600" />
        </div>
        <div className="space-y-2">
          <p className="font-medium text-lg">Assignment config has been saved</p>
          <p className="text-gray-500 text-sm">
            Do you want to trigger regrading for the students assigned to this config?
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button onClick={closeModal} className="!font-normal text-gray-600 hover:bg-gray-200">
          Ignore
        </Button>
        <Button onClick={triggerRegrade} className="bg-cse-600 text-white hover:bg-cse-400">
          Regrade
        </Button>
      </div>
    </Modal>
  );
}

export default RegradePromptModal;
