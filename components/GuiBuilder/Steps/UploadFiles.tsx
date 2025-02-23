import AssignmentSupportingFilesUploader from "@/components/AssignmentSupportingFilesUploader";
import { FilesProvider } from "@/contexts/assignmentSupportingFiles";
import { useLayoutDispatch, useLayoutState } from "@/contexts/layout";
import { useStoreState } from "@/store/GuiBuilder";
import { ScrollArea } from "@mantine/core";
import { useEffect } from "react";

function UploadFiles() {
  const { assignmentConfigId } = useLayoutState();
  const dispatch = useLayoutDispatch();

  const configId = useStoreState((state) => state.config.configId);

  /**
   * {@link AssignmentSupportingFilesUploader} expects {@link assignmentConfigId} in the
   * layout state to be non-null.
   */
  useEffect(() => {
    if (assignmentConfigId === undefined) {
      dispatch({ type: "setAssignmentConfigId", payload: configId });
    }
  }, [assignmentConfigId, configId, dispatch]);

  // Config ID should not be null from 2nd step onwards
  if (configId === null) {
    return null;
  }

  return (
    <ScrollArea type="auto" className="h-full py-6 bg-cool-gray-50 drop-shadow rounded-md">
      <FilesProvider>
        {assignmentConfigId !== undefined && (
          <AssignmentSupportingFilesUploader
            onSaveSuccess={() => {
              dispatch({
                type: "showNotification",
                payload: {
                  success: true,
                  title: "Complementary files uploaded",
                },
              });
            }}
          />
        )}
      </FilesProvider>
    </ScrollArea>
  );
}

export default UploadFiles;
