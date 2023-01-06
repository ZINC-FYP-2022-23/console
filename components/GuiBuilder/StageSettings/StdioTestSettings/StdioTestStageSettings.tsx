import InfoTooltip from "@components/GuiBuilder/Diagnostics/InfoTooltip";
import { MultiSelect, TagsInput } from "@components/Input";
import { useSelectedStageConfig, useStoreState } from "@state/GuiBuilder/Hooks";
import { StdioTest } from "@types";
import { FocusEventHandler, memo } from "react";
import { diffIgnoreFlagOptions } from "./inputOptions";

/**
 * Stage Settings page for the "Standard I/O Test" settings panel.
 */
function StdioTestStageSettings() {
  const [config, setConfig] = useSelectedStageConfig<StdioTest>();
  const language = useStoreState((state) => state.editingConfig._settings.lang.language);

  const isPipDisabled = language !== "python" && !config.additional_packages.includes("python3-pip");

  /** If user has typed something in the input box of tags input, add it to the list of tags. */
  const onTagInputBlur = (
    target: "additional_packages" | "additional_pip_packages",
  ): FocusEventHandler<HTMLInputElement> => {
    return (e) => {
      const value = e.target.value.trim();
      if (value === "") return;
      if (!config[target]!.includes(value)) {
        setConfig({ ...config, [target]: [...(config[target] as string[]), value] });
        e.target.value = "";
      }
    };
  };

  return (
    <div>
      <p className="mb-4 font-semibold text-xl">Stage Settings</p>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-[2]">
            <label htmlFor="diff_ignore_flags">Diff ignore flags</label>
            <p className="text-xs text-gray-500">
              What to ignore when comparing standard output against expected output
            </p>
          </div>
          <div className="flex-[3]">
            <MultiSelect
              data={diffIgnoreFlagOptions}
              value={config.diff_ignore_flags}
              onChange={(value) => setConfig({ ...config, diff_ignore_flags: value })}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-[2] flex items-center gap-1">
            <label htmlFor="additional_packages">Additional packages</label>
            <AdditionalPackagesTooltip />
          </div>
          <TagsInput
            name="additional_packages"
            value={config.additional_packages}
            onChange={(tags) => setConfig({ ...config, additional_packages: tags })}
            onBlur={onTagInputBlur("additional_packages")}
            placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
            separators={[" ", ","]}
            isEditOnRemove
            className="flex-[3] font-mono text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-[2] flex items-center gap-1">
            <label htmlFor="additional_pip_packages">Additional pip packages</label>
            <AdditionalPipPackagesTooltip />
          </div>
          <div className="flex-[3]">
            <TagsInput
              name="additional_pip_packages"
              value={config.additional_pip_packages}
              onChange={(tags) => setConfig({ ...config, additional_pip_packages: tags })}
              onBlur={onTagInputBlur("additional_pip_packages")}
              disabled={isPipDisabled}
              placeHolder={
                isPipDisabled && config.additional_pip_packages.length === 0
                  ? "Add `python3-pip` to 'Additional packages' first"
                  : ""
              }
              separators={[" ", ","]}
              isEditOnRemove
              className="flex-[3] font-mono text-sm"
            />
            {isPipDisabled && config.additional_pip_packages.length > 0 && (
              <p className="text-xs mt-1 text-orange-600">
                Please add <code>python3-pip</code> to &quot;Additional packages&quot; first
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
const AdditionalPackagesTooltip = memo(() => (
  <InfoTooltip>
    <ul className="px-3 text-sm list-disc">
      <li>Dependencies to install before running the executable to test its output</li>
      <li>
        They will be installed by your container&apos;s package manager (e.g. <code>apt-get</code>)
      </li>
    </ul>
  </InfoTooltip>
));
AdditionalPackagesTooltip.displayName = "AdditionalPackagesTooltip";

const AdditionalPipPackagesTooltip = memo(() => (
  <InfoTooltip width={500}>
    <ul className="px-3 text-sm list-disc">
      <li>
        <a href="https://pypi.org/project/pip/" target="_blank" rel="noreferrer" className="underline text-blue-700">
          Pip
        </a>{" "}
        packages to install before running the executable to test its output
      </li>
      <li>
        If you&apos;re not using Python, you must first add <code>python3-pip</code> in &quot;Additional packages&quot;
        to install Pip
      </li>
    </ul>
  </InfoTooltip>
));
AdditionalPipPackagesTooltip.displayName = "AdditionalPipPackagesTooltip";

export default StdioTestStageSettings;