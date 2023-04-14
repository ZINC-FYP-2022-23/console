import { Spinner } from "@/components/Spinner";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreState } from "@/store/GuiBuilder";
import { TestCase } from "@/types/GuiBuilder";
import { getTestCaseExpectedOutputHash } from "@/utils/GuiBuilder/stageConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ControlledEditor } from "@monaco-editor/react";
import debounce from "lodash/debounce";
import { GetGeneratedFileResponse } from "pages/api/configs/[assignmentConfigId]/generated";
import { useEffect, useMemo, useState } from "react";

interface GeneratedExpectedOutputCardProps {
  /** ID of the test case. */
  caseId: number;
}

/**
 * A card that shows the auto-generated expected output of a test case if that feature is on.
 */
function GeneratedExpectedOutputCard({ caseId }: GeneratedExpectedOutputCardProps) {
  const [config] = useSelectedStageConfig("StdioTest");

  const configId = useStoreState((state) => state.config.configId);
  const [outputData, setOutputData] = useState<GetGeneratedFileResponse | null>(null);

  const fetchGeneratedExpectedOutput = useMemo(
    () =>
      debounce(
        async (testCases: TestCase[]) => {
          const testCase = testCases.find((test) => test.id === caseId);
          if (!testCase) return;
          const expectedOutputHash = getTestCaseExpectedOutputHash(testCase);
          try {
            const response = await fetch(`/api/configs/${configId}/generated?fileName=${expectedOutputHash}`);
            setOutputData(await response.json());
          } catch {
            setOutputData({ content: null, error: "An unknown error occurred" });
          }
        },
        600,
        { leading: true },
      ),
    [caseId, configId],
  );

  useEffect(() => {
    if (configId !== null && config?.testCases) {
      fetchGeneratedExpectedOutput(config.testCases);
    }
  }, [config?.testCases, configId, fetchGeneratedExpectedOutput]);

  // A brand new config always does not have generated output
  if (configId === null) return <NoGeneratedOutputCard />;

  if (!outputData) {
    return (
      <div className="mb-3 px-3 pt-1 pb-5 bg-gray-50 rounded-lg drop-shadow">
        <p className="mb-3 text-gray-600 text-sm">Generated Expected Output (Read Only):</p>
        <Spinner className="mx-auto h-10 w-10 text-cse-500" />
      </div>
    );
  }
  return outputData.content !== null ? (
    <div className="h-80 mb-3 p-3 pt-1 pb-8 bg-gray-50 rounded-lg drop-shadow">
      <p className="mb-1 text-gray-600 text-sm">Generated Expected Output (Read Only):</p>
      <ControlledEditor options={{ fontSize: 12.5, readOnly: true }} value={outputData.content} />
    </div>
  ) : (
    <NoGeneratedOutputCard />
  );
}

/**
 * The card to show when no generated output is found.
 */
function NoGeneratedOutputCard() {
  return (
    <div className="mb-3 px-3 pt-1 pb-5 bg-gray-50 rounded-lg drop-shadow">
      <p className="mb-3 text-gray-600 text-sm">Generated Expected Output (Read Only):</p>
      <div className="flex flex-col items-center gap-3">
        <FontAwesomeIcon icon={["fad", "empty-set"]} size="3x" className="text-gray-500" />
        <p className="font-medium text-gray-600">No generated output found</p>
        <p className="space-y-1 text-sm text-gray-500">
          Expected output are generated in the <span className="font-semibold">Generate Output</span> step, which you
          will soon visit.
        </p>
      </div>
    </div>
  );
}

export default GeneratedExpectedOutputCard;
