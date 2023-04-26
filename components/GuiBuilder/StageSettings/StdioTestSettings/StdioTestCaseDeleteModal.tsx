import { Button, Modal, createStyles } from "@mantine/core";

interface StdioTestCaseDeleteModalProps {
  /** Test case ID to delete. This model will be hidden if its value is `null`. */
  testCaseIdToDelete: number | null;
  setTestCaseIdToDelete: (id: number | null) => void;
  /** Callback when the "Delete" button is pressed. */
  onDelete: (id: number) => void;
}

/**
 * A delete confirmation model when deleting a single test case.
 */
function StdioTestCaseDeleteModal({
  testCaseIdToDelete,
  setTestCaseIdToDelete,
  onDelete,
}: StdioTestCaseDeleteModalProps) {
  const { classes } = useStyles();

  return (
    <Modal
      title={`Delete test case #${testCaseIdToDelete}?`}
      opened={testCaseIdToDelete !== null}
      onClose={() => setTestCaseIdToDelete(null)}
      centered
      size="md"
      classNames={classes}
    >
      <div className="space-y-5">
        <p className="text-gray-800">Are you sure you want to delete test case #{testCaseIdToDelete}?</p>
        <div className="w-full flex items-center justify-end gap-3">
          <Button onClick={() => setTestCaseIdToDelete(null)} className="!font-normal text-gray-600 hover:bg-gray-200">
            Cancel
          </Button>
          <Button
            onClick={() => onDelete(testCaseIdToDelete!)}
            className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const useStyles = createStyles((theme) => ({
  title: {
    color: theme.colors.red[7],
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
  },
}));

export default StdioTestCaseDeleteModal;
