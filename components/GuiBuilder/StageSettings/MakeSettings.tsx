import { TagsInput, Textarea } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { getMakePreviewCommand } from "@/utils/GuiBuilder/stageConfig";
import { FocusEventHandler, memo } from "react";
import { InfoTooltip } from "../Diagnostics";
import { AdditionalPackagesTooltip } from "./common";

function MakeSettings() {
  const [config, setConfig] = useSelectedStageConfig("Make");

  if (!config) return null;

  const previewCommand = getMakePreviewCommand(config);

  /** If user has typed something in the input box of tags input, add it to the list of tags. */
  const onTagInputBlur = (target: "targets" | "additional_packages"): FocusEventHandler<HTMLInputElement> => {
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
    <div className="p-3">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="flex-[2]">
            <label htmlFor="targets">Target files to run</label>
            <p className="text-gray-500 text-xs">Leave blank if there are no targets</p>
          </div>
          <div className="flex-[3] flex">
            <TagsInput
              id="targets"
              value={config.targets}
              onChange={(tags) => setConfig({ ...config, targets: tags })}
              onBlur={onTagInputBlur("targets")}
              placeHolder={config.targets.length === 0 ? "No targets" : ""}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-[2]">
            <div className="flex items-center gap-1">
              <label htmlFor="args">
                Arguments to the <code>make</code> command
              </label>
              <ArgsTooltip />
            </div>
          </div>
          <Textarea
            id="args"
            value={config.args}
            onChange={(e) => setConfig({ ...config, args: e.target.value })}
            placeholder="e.g. -f Makefile"
            monospace
            styles={{ root: { flex: 3 } }}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-[2]">
            <div className="flex items-center gap-1">
              <label htmlFor="additional_packages">Additional packages</label>
              <AdditionalPackagesTooltip />
            </div>
          </div>
          <div className="flex-[3] flex">
            <TagsInput
              id="additional_packages"
              value={config.additional_packages}
              onChange={(tags) => setConfig({ ...config, additional_packages: tags })}
              onBlur={onTagInputBlur("additional_packages")}
              placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        <div className="px-3 py-2 mt-2 bg-gray-100 rounded-md space-y-2 text-sm">
          <p className="font-medium text-gray-600">Command that will be run:</p>
          <div className="px-4 py-2 bg-gray-700 font-mono text-white rounded">{previewCommand}</div>
        </div>
      </div>
    </div>
  );
}

const ArgsTooltip = memo(() => (
  <InfoTooltip>
    <ul className="px-3 text-sm list-disc">
      <li>
        Separate each flag with a <span className="font-semibold">space</span> (e.g. <code>-f Makefile</code>).
      </li>
      <li>
        <span className="font-semibold">No need</span> to re-specify the target files to run here.
      </li>
    </ul>
  </InfoTooltip>
));
ArgsTooltip.displayName = "ArgsTooltip";

export default MakeSettings;
