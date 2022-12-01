import { SwitchGroup } from "@components/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelectedStageConfig, useStoreActions } from "@state/GuiBuilder/Hooks";
import { DiffWithSkeleton } from "@types";

const excludeFromProvidedLabel = (
  <p>
    Exclude <code>provided</code> files from diff operation
  </p>
);

const excludeFromProvidedDesc = (
  <ul className="pl-5 text-sm text-gray-500 list-disc">
    <li>
      <code>provided</code> files are helper files used for grading
    </li>
    <li>
      If turned off, submitted files containing <code>provided</code> files will still be checked
    </li>
  </ul>
);

function DiffWithSkeleton() {
  const [config, setConfig] = useSelectedStageConfig<DiffWithSkeleton>();
  const setStep = useStoreActions((actions) => actions.setStep);

  return (
    <div className="p-4">
      <div className="flex items-center text-blue-500 gap-4">
        <FontAwesomeIcon icon={["far", "circle-info"]} />
        <p>
          Skeleton files are specified in the{" "}
          <button
            onClick={() => setStep("upload")}
            className="border-b border-blue-600 text-blue-600 font-medium leading-5"
          >
            Upload Files
          </button>{" "}
          step.
        </p>
      </div>
      <div className="mt-6">
        <SwitchGroup
          label={excludeFromProvidedLabel}
          description={excludeFromProvidedDesc}
          checked={config.exclude_from_provided}
          onChange={(value) => {
            setConfig({ ...config, exclude_from_provided: value });
          }}
        />
      </div>
    </div>
  );
}

export default DiffWithSkeleton;
