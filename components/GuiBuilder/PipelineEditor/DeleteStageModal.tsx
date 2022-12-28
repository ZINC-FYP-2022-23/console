import Button from "@components/Button";
import { createStyles, Modal } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";

const useStyles = createStyles((theme) => ({
  title: {
    color: theme.colors.red[7],
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
}));

/**
 * A modal to confirm stage deletion.
 */
function DeleteStageModal() {
  const { classes } = useStyles();

  const isModalOpened = useStoreState((state) => state.layout.modal.deleteStage);
  const selectedStage = useStoreState((state) => state.selectedStage);
  const deleteStageNode = useStoreActions((actions) => actions.deleteStageNode);
  const setModal = useStoreActions((actions) => actions.setModal);

  const closeModal = () => setModal({ path: "deleteStage", value: false });

  return (
    <Modal
      title={
        selectedStage
          ? `Delete "${selectedStage.nameInUi}${selectedStage.label ? ` (${selectedStage.label})` : ""}" stage?`
          : "Delete stage?"
      }
      opened={isModalOpened}
      onClose={closeModal}
      centered
      size="md"
      classNames={classes}
    >
      <div className="space-y-5">
        <p className="text-gray-800">
          Are you sure you want to delete this stage? This action{" "}
          <span className="font-semibold">cannot be undone</span>.
        </p>
        <div className="w-full flex items-center justify-end gap-3">
          <Button onClick={closeModal} className="!font-normal text-gray-600 hover:bg-gray-200">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedStage) deleteStageNode(selectedStage.id);
              closeModal();
            }}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteStageModal;
