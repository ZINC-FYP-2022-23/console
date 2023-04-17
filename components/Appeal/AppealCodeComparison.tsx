import { DiffSubmissionsData } from "@/types/appeal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx, createStyles } from "@mantine/core";
import { ReactGhLikeDiff } from "react-gh-like-diff";

type AppealCodeComparisonProps = {
  diffData: DiffSubmissionsData;
};

/**
 * Shows a Github-like diff view to compare an old submission and a new submission.
 */
function AppealCodeComparison({ diffData }: AppealCodeComparisonProps) {
  const useStyles = createStyles(() => ({
    diffView: {
      "& .d2h-file-name": {
        // Overrides the hidden file name in `index.css`
        display: "block !important",
      },
    },
  }));

  const { classes } = useStyles();
  const { diff, error, status } = diffData;

  if (status === -1) {
    return <p className="mt-8 text-center text-gray-600">This appeal attempt does not include a file submission.</p>;
  }

  if (status !== 200) {
    return (
      <div className="mt-8 flex flex-col items-center space-y-5 text-red-500">
        <FontAwesomeIcon icon={["far", "circle-exclamation"]} size="3x" />
        <div className="space-y-2 text-center">
          <p>An error occurred while comparing old and new submissions.</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (diff === "") {
    return (
      <p className="mt-8 text-center text-gray-600">The new appeal submission is the same as the old submission.</p>
    );
  }
  return (
    <div className={clsx("relative", classes.diffView)}>
      <ReactGhLikeDiff
        options={{
          outputFormat: "side-by-side",
          showFiles: true,
        }}
        diffString={diff}
      />
    </div>
  );
}

export default AppealCodeComparison;
