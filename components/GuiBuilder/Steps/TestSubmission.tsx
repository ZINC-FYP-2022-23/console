import { useStoreState } from "@store/GuiBuilder";
import LockedStep from "./LockedStep";

function TestSubmission() {
  const configId = useStoreState((state) => state.config.configId);

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
