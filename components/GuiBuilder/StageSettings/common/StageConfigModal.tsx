import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createStyles, Modal, ModalProps } from "@mantine/core";

/**
 * Accepts the same props as {@link https://mantine.dev/core/modal/?t=props Mantine Modal} component.
 */
interface StageConfigModalProps extends ModalProps {}

/**
 * A custom {@link https://mantine.dev/core/modal/?t=props Mantine Modal} that can display the stage
 * configuration in near full viewport height.
 *
 * This works great if a stage has many configuration options that takes up a lot of vertical space.
 */
function StageConfigModal({ children, title, onClose, withCloseButton = true, ...props }: StageConfigModalProps) {
  const { classes } = useStyles();
  return (
    <Modal
      overflow="inside"
      size="70%"
      onClose={onClose}
      transitionDuration={200}
      withCloseButton={false} // We have our own close button
      classNames={classes}
      {...props}
    >
      {(title || withCloseButton) && (
        <div className="mb-4 flex justify-between">
          <div className="font-semibold text-cse-400 text-xl">{title}</div>
          {withCloseButton && (
            <Button
              icon={<FontAwesomeIcon icon={["far", "xmark-large"]} />}
              onClick={onClose}
              className="bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 active:bg-gray-300"
            >
              Save & Close
            </Button>
          )}
        </div>
      )}
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
    </Modal>
  );
}

const useStyles = createStyles(() => ({
  inner: {
    padding: "60px 16px",
  },
  modal: {
    height: "100%",
  },
  body: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    maxHeight: "none !important",
  },
}));

export default StageConfigModal;
