import { SwitchGroup } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  if (!config) return null;

  return (
    <div className="p-4">
      <div className="flex items-center text-blue-500 gap-4">
        <FontAwesomeIcon icon={["far", "circle-info"]} />
        <p>
          Skeleton files are specified in the <span className="font-semibold">Upload Files</span> step &gt; &quot;Files
          gave to the students&quot;.
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

export default DiffWithSkeletonSettings;
