import Button from "@/components/Button";
import { SwitchGroup } from "@/components/Input";
import { useSelectedStageConfig, useSelectedStageDiagnostics } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Diagnostic, Settings } from "@/types/GuiBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert } from "../Diagnostics";

const excludeFromProvidedDesc = (
  <ul className="pl-5 text-sm text-gray-500 list-disc">
    <li>&quot;Additional files for grading&quot; are driver programs that are only used in the grading process</li>
    <li>Usually we turn enable this option</li>
  </ul>
);

function DiffWithSkeletonSettings() {
  const [config, setConfig] = useSelectedStageConfig("DiffWithSkeleton");

  const useSkeleton = useStoreState((state) => state.config.editingConfig._settings.use_skeleton);
  const useProvided = useStoreState((state) => state.config.editingConfig._settings.use_provided);

  if (!config) return null;

  return (
    <div className="p-4 space-y-5">
      {!useSkeleton && <UseSkeletonOffAlert />}
      <div className="flex items-center gap-3 text-blue-500">
        <FontAwesomeIcon icon={["far", "circle-info"]} />
        <p>
          Skeleton files are specified in the <span className="font-semibold">Upload Files</span> step &gt; &quot;Files
          gave to the students&quot;.
        </p>
      </div>
      <div>
        <SwitchGroup
          id="exclude_from_provided"
          label='Exclude "additional files for grading" from diff operation'
          description={excludeFromProvidedDesc}
          checked={config.exclude_from_provided}
          onChange={(value) => {
            setConfig({ ...config, exclude_from_provided: value });
          }}
        />
        {config.exclude_from_provided && !useProvided && (
          <div className="mt-2 ml-16">
            <UseProvidedOffAlert />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Alert to show when {@link Settings.use_skeleton} flag is off. This is because this flag must be on
 * if the user wants to use the DiffWithSkeleton stage.
 */
function UseSkeletonOffAlert() {
  const [diagnostics, resolveDiagnostics] = useSelectedStageDiagnostics();
  const updateSettings = useStoreActions((actions) => actions.config.updateSettings);

  const isUseSkeletonOffError = (d: Diagnostic) =>
    d.type === "MISSING_FIELD_ERROR" && !!d.message.match(/use_skeleton/);
  const hasUseSkeletonOffError = diagnostics.some(isUseSkeletonOffError);

  return (
    <Alert severity={hasUseSkeletonOffError ? "error" : "warning"} data-cy="use-skeleton-off-alert">
      <div>
        <p>You must enable &quot;Allow pipeline stages to access skeleton code&quot; in the Pipeline Settings.</p>
        <Button
          onClick={() => {
            updateSettings((_settings) => (_settings.use_skeleton = true));
            resolveDiagnostics(isUseSkeletonOffError);
          }}
          icon={<FontAwesomeIcon icon={["fad", "toggle-on"]} />}
          className="mt-1 bg-cse-600 text-sm text-white hover:bg-cse-500 active:bg-cse-400"
        >
          Click me to enable
        </Button>
      </div>
    </Alert>
  );
}

/**
 * Alert to show when `exclude_from_provided` is on while {@link Settings.use_provided} flag is off (which should
 * be on).
 */
function UseProvidedOffAlert() {
  const [diagnostics, resolveDiagnostics] = useSelectedStageDiagnostics();
  const updateSettings = useStoreActions((actions) => actions.config.updateSettings);

  const isUseProvidedOffError = (d: Diagnostic) =>
    d.type === "MISSING_FIELD_ERROR" && !!d.message.match(/use_provided/);
  const hasUseProvidedOffError = diagnostics.some(isUseProvidedOffError);

  return (
    <Alert severity={hasUseProvidedOffError ? "error" : "warning"} data-cy="use-provided-off-alert">
      <div>
        <p>You must enable &quot;Use additional files for grading&quot; in the Pipeline Settings.</p>
        <Button
          onClick={() => {
            updateSettings((_settings) => (_settings.use_provided = true));
            resolveDiagnostics(isUseProvidedOffError);
          }}
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
