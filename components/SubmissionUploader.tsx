import { useLayoutDispatch } from "@/contexts/layout";
import { useZinc } from "@/contexts/zinc";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface SubmissionUploaderProps {
  assignmentConfigId: number;
  /**
   * Explicitly set the `isTest` flag in the Redis payload of the grading task. If not specified, `isTest` will
   * be evaluated to true in the webhook if the user is a TA.
   *
   * The Grader may process the pipeline differently when `isTest` is true. For example, the `StdioTest` stage
   * has a feature called "auto-generate expected output of test cases". If the feature is enabled and `isTest`
   * is true, the Grader will generate expected outputs and will not grade the assignment by diff-ing.
   *
   * Sometimes we may want to explicitly set `isTest` to false to simulate that the submission is uploaded by
   * a student.
   */
  isTest?: boolean;
  /** It should be a `<button />` element. */
  children: React.ReactNode;
}

/**
 * A wrapper for adding assignment submission functionality to a button.
 */
function SubmissionUploader({ assignmentConfigId, isTest, children }: SubmissionUploaderProps) {
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
        const { status } = await submitFile(files, assignmentConfigId, user, isTest);
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
    [assignmentConfigId, dispatch, isTest, submitFile, user],
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
