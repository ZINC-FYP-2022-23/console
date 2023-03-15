import Button from "@/components/Button";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { createStyles, Modal } from "@mantine/core";
import Image from "next/image";

const useStyles = createStyles((theme) => ({
  title: {
    color: "#3b82f6",
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
}));

/**
 * A modal that teaches how to create a connection between two nodes.
 */
function ConnectNodesTutorialModal() {
  const { classes } = useStyles();

  const isModalOpened = useStoreState((state) => state.layout.modal.connectNodesTutorial);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const closeModal = () => setModal({ path: "connectNodesTutorial", value: false });

  return (
    <Modal
      title="How to Connect Stage Nodes"
      opened={isModalOpened}
      onClose={closeModal}
      centered
      size="lg"
      classNames={classes}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p>
            To specify the execution order of stages, <span className="font-semibold">ALL</span> the stage nodes should
            be connected to each other.
          </p>
          <p>In the below example, Diff With Skeleton will be executed before Compile.</p>
        </div>
        <div className="text-center">
          <Image src="/assets/gui_editor_create_connection.png" alt="creating a connection" width={480} height={303} />
        </div>
        <Button onClick={closeModal} className="mx-auto bg-cse-700 text-white hover:bg-cse-500">
          OK
        </Button>
      </div>
    </Modal>
  );
}

export default ConnectNodesTutorialModal;
