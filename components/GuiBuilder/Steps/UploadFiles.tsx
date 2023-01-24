import AssignmentSupportingFilesUploader from "@/components/AssignmentSupportingFilesUploader";
import { FilesProvider } from "@/contexts/assignmentSupportingFiles";
import { useLayoutDispatch, useLayoutState } from "@/contexts/layout";
import { useStoreState } from "@/store/GuiBuilder";
import { useEffect } from "react";
import LockedStep from "./LockedStep";

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

  if (configId === null) {
    return <LockedStep />;
  }

  return (
    <div className="py-6 bg-cool-gray-50 drop-shadow rounded-md space-y-4">
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
    </div>
  );
}

export default UploadFiles;
