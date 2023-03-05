import { useLayoutDispatch } from "@/contexts/layout";
import { useZinc } from "@/contexts/zinc";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface SubmissionUploaderProps {
  assignmentConfigId: number;
  /** It should be a `<button />` element. */
  children: React.ReactNode;
}

/**
 * A wrapper for adding assignment submission functionality to a button.
 */
function SubmissionUploader({ assignmentConfigId, children }: SubmissionUploaderProps) {
  const { user, submitFile } = useZinc();
  const dispatch = useLayoutDispatch();

  const onDrop = useCallback(
    async (files) => {
      if (files.length === 0) {
        dispatch({
          type: "showNotification",
          payload: {
            title: "Invalid file type",
            message: "Your submission contains file that are not supported, please try again",
            success: false,
          },
        });
        return;
      }

      try {
        const { status } = await submitFile(files, assignmentConfigId, user);
        if (status === "success") {
          dispatch({
            type: "showNotification",
            payload: {
              title: "Submission upload completed",
              message: "Your work has been submitted successfully.",
              success: true,
            },
          });
        }
      } catch (error: any) {
        dispatch({
          type: "showNotification",
          payload: {
            title: "Submission failed",
            message: error.message,
            success: false,
          },
        });
      }
    },
    [assignmentConfigId, dispatch, submitFile, user],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".h,.cpp,.rar,.zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed",
  });

  return (
    <div {...getRootProps()} role="button">
      <input {...getInputProps()} />
      {children}
    </div>
  );
}

export default SubmissionUploader;
