import Button from "@components/Button";
import { createStyles, Modal } from "@mantine/core";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import Image from "next/image";

const useStyles = createStyles((theme) => ({
  title: {
    color: "#3b82f6",
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
}));

/**
 * A modal to display help information for the stage label input.
 */
function StageLabelInfoModal() {
  const { classes } = useStyles();

  const isModalOpened = useStoreState((state) => state.layout.modal.stageLabelInfo);
  const setModal = useStoreActions((actions) => actions.setModal);

  const closeModal = () => setModal({ path: "stageLabelInfo", value: false });

  return (
    <Modal
      title="What is Stage Label?"
      opened={isModalOpened}
      onClose={closeModal}
      centered
      size="lg"
      classNames={classes}
    >
      <div className="flex flex-col gap-2">
        <ul className="ml-6 list-disc">
          <li>
            You can <span className="font-semibold">optionally</span> give the stage a label to display it in the
            pipeline editor.
          </li>
          <li>
            This helps you <span className="font-semibold">quickly differentiate</span> multiple stages having the{" "}
            <span className="font-semibold">same name</span> (e.g. multiple &quot;Standard I/O Test&quot; stages).
          </li>
        </ul>
        <Image src="/assets/gui_editor_stage_label.svg" alt="stage label" width={650} height={172} />
        <Button onClick={closeModal} className="mx-auto bg-cse-700 text-white hover:bg-cse-500">
          OK
        </Button>
      </div>
    </Modal>
  );
}

export default StageLabelInfoModal;
