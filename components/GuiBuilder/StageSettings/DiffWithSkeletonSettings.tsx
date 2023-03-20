import Button from "@/components/Button";
import { SwitchGroup } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Settings } from "@/types/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert } from "../Diagnostics";

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
      Usually we turn this on. If turned off, submitted files containing <code>provided</code> files will still be
      checked
    </li>
  </ul>
);

function DiffWithSkeletonSettings() {
  const [config, setConfig] = useSelectedStageConfig("DiffWithSkeleton");

  const useSkeleton = useStoreState((state) => state.config.editingConfig._settings.use_skeleton);

  if (!config) return null;

  return (
    <div className="p-4 space-y-5">
      {!useSkeleton && <UseSkeletonOffAlert />}
      <div className="flex items-center text-blue-500 gap-4">
        <FontAwesomeIcon icon={["far", "circle-info"]} />
        <p>
          Skeleton files are specified in the <span className="font-semibold">Upload Files</span> step &gt; &quot;Files
          gave to the students&quot;.
        </p>
      </div>
      <div>
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

/**
 * Alert to show when {@link Settings.use_skeleton} flag is off. This is because this flag must be on
 * if the user wants to use the DiffWithSkeleton stage.
 */
function UseSkeletonOffAlert() {
  const updateSettings = useStoreActions((actions) => actions.config.updateSettings);
  return (
    <Alert severity="warning">
      <div>
        <p>Please enable the &quot;Provide skeleton code to students&quot; option in the Pipeline Settings.</p>
        <Button
          onClick={() => updateSettings((_settings) => (_settings.use_skeleton = true))}
          icon={<FontAwesomeIcon icon={["fad", "toggle-on"]} />}
          className="mt-1 bg-cse-600 text-sm text-white hover:bg-cse-500 active:bg-cse-400"
        >
          Click me to enable
        </Button>
      </div>
    </Alert>
  );
}

export default DiffWithSkeletonSettings;
