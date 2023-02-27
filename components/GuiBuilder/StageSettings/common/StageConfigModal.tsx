import { createStyles, Modal, ModalProps } from "@mantine/core";

/**
 * A modal that can display the stage configuration in near full viewport height.
 *
 * This works great if a stage has many configuration options that takes up a lot of vertical space.
 */
function StageConfigModal({ children, ...props }: ModalProps) {
  const { classes } = useStyles();
  return (
    <Modal overflow="inside" size="70%" transitionDuration={200} classNames={classes} {...props}>
      {children}
    </Modal>
  );
}

const useStyles = createStyles((theme) => ({
  inner: {
    padding: "60px 16px",
  },
  modal: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: theme.colors.blue[3],
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
  body: {
    height: "100%",
  },
}));

export default StageConfigModal;
