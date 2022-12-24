import { useStoreState } from "@state/GuiBuilder/Hooks";
import LockedStep from "./LockedStep";

function TestSubmission() {
  const configId = useStoreState((state) => state.configId);

  if (configId === null) {
    return <LockedStep />;
  }

  return (
    <div>
      <p>TODO: Investigate how we should re-use the Test My Submission page component while minimizing coupling.</p>
      <p>The ZINC team prefers embedding current UI instead of an external link to that page.</p>
    </div>
  );
}

export default TestSubmission;
