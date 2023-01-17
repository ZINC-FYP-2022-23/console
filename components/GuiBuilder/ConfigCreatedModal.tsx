import Button from "@components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, useMantineTheme } from "@mantine/core";
import { useStoreActions, useStoreState } from "@store/GuiBuilder";
import { useRouter } from "next/router";

/**
 * The modal to show after the user has created a new assignment config.
 */
function ConfigCreatedModal() {
  const theme = useMantineTheme();
  const router = useRouter();

  const configId = useStoreState((state) => state.config.configId);
  const isModalOpened = useStoreState((state) => state.layout.modal.configCreated);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const assignmentId = router.query.assignmentId as string;

  const updateConfigIdQueryParam = () => {
    if (configId === null) {
      console.error("configId should equal to the ID of the newly created config but 'null' is received");
    } else {
      router.push(`/assignments/${assignmentId}/configs/${configId}/gui`, undefined, { shallow: true });
    }
    setModal({ path: "configCreated", value: false });
  };

  return (
    <Modal
      opened={isModalOpened}
      onClose={updateConfigIdQueryParam}
      closeOnClickOutside={false}
      centered
      overlayColor={theme.colors.gray[7]}
      withCloseButton={false}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="px-5 flex flex-col items-center gap-3">
          <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-green-100">
            <FontAwesomeIcon icon={["fas", "check"]} className="text-lg text-green-600" />
          </div>
          <p className="font-medium text-center text-lg">Assignment Config created successfully</p>
          <div className="w-full text-sm text-gray-600">
            <p>You can now:</p>
            <ul className="pl-5 mt-1 list-disc">
              <li>Upload helper files</li>
              <li>Test submissions</li>
              <li>Assign students to this assignment</li>
            </ul>
          </div>
        </div>
        <Button onClick={updateConfigIdQueryParam} className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
          Continue
        </Button>
      </div>
    </Modal>
  );
}

export default ConfigCreatedModal;
