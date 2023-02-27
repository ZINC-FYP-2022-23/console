import { TagsInput, Textarea } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { FocusEventHandler } from "react";
import { AdditionalPackagesTooltip } from "./common";

function ShellExecSettings() {
  const [config, setConfig] = useSelectedStageConfig("ShellExec");

  if (!config) return null;

  /** If user has typed something in the `additional_packages` input, add it to the list of tags. */
  const onTagInputBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value.trim();
    if (value === "") return;
    if (!config.additional_packages.includes(value)) {
      setConfig({ ...config, additional_packages: [...config.additional_packages, value] });
      e.target.value = "";
    }
  };

  return (
    <div className="p-3 space-y-4">
      <div className="flex gap-3">
        <label htmlFor="cmd" className="mt-2 flex-1">
          Command to execute <span className="text-red-600 text-xs">(required)</span>
        </label>
        <Textarea
          id="cmd"
          value={config.cmd}
          onChange={(e) => setConfig({ ...config, cmd: e.target.value })}
          placeholder="e.g. touch foo.txt"
          monospace
          styles={{ root: { flex: 2 } }}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <label htmlFor="additional_packages">Additional packages</label>
            <AdditionalPackagesTooltip />
          </div>
        </div>
        <TagsInput
          name="additional_packages"
          value={config.additional_packages}
          onChange={(tags) => setConfig({ ...config, additional_packages: tags })}
          onBlur={onTagInputBlur}
          placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
          className="flex-[2] font-mono text-sm"
        />
      </div>
    </div>
  );
}

export default ShellExecSettings;
