import { TagsInput, Textarea } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { Make } from "@/types";
import { FocusEventHandler, memo } from "react";
import { InfoTooltip } from "../Diagnostics";
import { AdditionalPackagesTooltip, InfoAccordion } from "./common";

function MakeSettings() {
  const [config, setConfig] = useSelectedStageConfig<Make>();

  if (!config) return null;

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
      <div className="pb-12 border-b border-gray-300 space-y-4">
        <div className="flex">
          <div className="flex-[2]">
            <label htmlFor="targets">Target files to run</label>
            <p className="text-gray-500 text-xs">Leave blank if there are no targets</p>
          </div>
          <div className="flex-[3] flex">
            <TagsInput
              name="targets"
              value={config.targets ?? []}
              onChange={(tags) => setConfig({ ...config, targets: tags })}
              onBlur={onTagInputBlur("targets")}
              placeHolder={config.targets.length === 0 ? "No targets" : ""}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex">
          <div className="flex-[2] flex items-center gap-1">
            <label htmlFor="args">
              Arguments to the <code>make</code> command
            </label>
            <ArgsTooltip />
          </div>
          <Textarea
            id="args"
            value={config.args ?? ""}
            onChange={(e) => setConfig({ ...config, args: e.target.value })}
            placeholder="e.g. -f Makefile"
            monospace
            styles={{ root: { flex: 3 } }}
          />
        </div>
        <div className="flex">
          <div className="flex-[2] flex items-center gap-1">
            <label htmlFor="additional_packages">Additional packages</label>
            <AdditionalPackagesTooltip />
          </div>
          <div className="flex-[3] flex">
            <TagsInput
              name="additional_packages"
              value={config.additional_packages ?? []}
              onChange={(tags) => setConfig({ ...config, additional_packages: tags })}
              onBlur={onTagInputBlur("additional_packages")}
              placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>
      <InfoAccordion title="Example">
        <ul className="ml-5 mb-2 list-disc">
          <li>
            Target files to run: <code>all</code>
          </li>
          <li>
            Arguments to the <code>make</code> command: <code>-f Makefile2</code>
          </li>
        </ul>
        <p>
          This will run &quot;<code>make -f Makefile2 all</code>&quot;
        </p>
      </InfoAccordion>
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
