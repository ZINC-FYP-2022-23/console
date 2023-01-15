import Button from "@components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStoreActions } from "@store/GuiBuilder";

/**
 * A locked step. Some steps are locked when creating a new config because they require
 * a non-null config ID to work properly.
 */
function LockedStep() {
  const setStep = useStoreActions((actions) => actions.layout.setStep);

  return (
    <div className="mt-20 flex flex-col items-center">
      <FontAwesomeIcon icon={["fad", "lock-keyhole"]} className="text-7xl text-gray-600" />
      <h1 className="mt-8 text-4xl font-semibold text-gray-700">Locked Step</h1>
      <div className="mt-8 space-y-1 text-center text-lg text-gray-500">
        <p>Sorry, this step is locked because you haven&apos;t created the config.</p>
        <p>To create the config, press the &quot;Create&quot; button at the top right corner.</p>
      </div>
      <Button
        className="mt-12 bg-cse-500 text-white hover:bg-cse-600 active:bg-cse-700"
        onClick={() => setStep("settings")}
      >
        Back to General Settings
      </Button>
    </div>
  );
}

export default LockedStep;
