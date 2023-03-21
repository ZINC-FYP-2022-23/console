import { TagsInput, Textarea, TextInput } from "@/components/Input";
import { cFamilyCompileDefault } from "@/constants/GuiBuilder/supportedLanguages";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreState } from "@/store/GuiBuilder";
import { getCompilePreviewCommand } from "@/utils/GuiBuilder/stageConfig";
import { FocusEventHandler, memo } from "react";
import { DeepReadonly } from "utility-types";
import { InfoTooltip } from "../Diagnostics";
import { AdditionalPackagesTooltip } from "./common";

type ConfigMetadata = DeepReadonly<{
  input: {
    /** Placeholder text for the input files. */
    placeholder?: string;
  };
  output: {
    /** Default value of output file name. */
    defaultValue?: string;
    /** Whether to disable the output file input box. */
    disabled?: boolean;
  };
  flags: {
    /** Default value for the command-line flags input box. */
    defaultValue?: string;
  };
}>;

/**
 * Gets the language-specific metadata for each input field.
 *
 * See {@link https://docs.zinc.ust.dev/user/pipeline/docker/Compile.html#config the Grader docs} for
 * more information.
 */
const getConfigMetadata = (lang: string): ConfigMetadata => {
  switch (lang) {
    case "cpp":
      return {
        input: { placeholder: "e.g. *.cpp" },
        output: { defaultValue: cFamilyCompileDefault.output },
        flags: { defaultValue: cFamilyCompileDefault.flags },
      };
    case "java":
      return {
        input: { placeholder: "e.g. *.java" },
        output: { disabled: true },
        flags: { defaultValue: "-d ." },
      };
    default:
      return {
        input: {},
        output: {},
        flags: {},
      };
  }
};

function CompileSettings() {
  const [config, setConfig] = useSelectedStageConfig("Compile");
  const lang = useStoreState((state) => state.config.editingConfig._settings.lang);

  if (!config) return null;

  const metadata = getConfigMetadata(lang.language);
  const previewCommand = getCompilePreviewCommand(lang, config);

  /** If user has typed something in the input box of tags input, add it to the list of tags. */
  const onTagInputBlur = (target: "input" | "additional_packages"): FocusEventHandler<HTMLInputElement> => {
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
    <div className="p-3 flex flex-col gap-4">
      <div className="flex gap-3">
        <label htmlFor="input" className="mt-2 flex-1">
          Input files <span className="text-red-600 text-xs">(required)</span>
        </label>
        <TagsInput
          name="input"
          value={config.input}
          onChange={(tags) => setConfig({ ...config, input: tags })}
          onBlur={onTagInputBlur("input")}
          placeHolder={config.input.length === 0 ? metadata.input.placeholder : ""}
          className="flex-[2] font-mono text-sm"
        />
      </div>
      <div className="flex gap-3 items-center">
        <label htmlFor="output" className="mt-2 flex-1">
          Output file name
        </label>
        <TextInput
          id="output"
          value={metadata.output.disabled ? "" : config.output ?? ""}
          onChange={(e) => setConfig({ ...config, output: e.target.value })}
          placeholder={metadata.output.disabled ? "No need to specify" : metadata.output.defaultValue}
          disabled={metadata.output.disabled}
          classNames={{ root: "flex-[2]", input: "font-mono placeholder:disabled:font-sans" }}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <label htmlFor="flags">Command-line flags</label>
            <FlagsTooltip />
          </div>
        </div>
        <Textarea
          id="flags"
          value={config.flags ?? ""}
          onChange={(e) => setConfig({ ...config, flags: e.target.value })}
          placeholder={metadata.flags.defaultValue ?? "e.g. -verbose -nowarn"}
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
          onBlur={onTagInputBlur("additional_packages")}
          placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
          className="flex-[2] font-mono text-sm"
        />
      </div>
      {previewCommand && (
        <div className="px-3 py-2 mt-2 bg-gray-100 rounded-md space-y-2 text-sm">
          <p className="font-medium text-gray-600">Compilation command preview:</p>
          <div className="px-4 py-2 bg-gray-700 font-mono text-white rounded">{previewCommand}</div>
        </div>
      )}
    </div>
  );
}

const FlagsTooltip = memo(() => (
  <InfoTooltip>
    <ul className="px-3 text-sm list-disc">
      <li>They will be fed into the language&apos;s compilation command.</li>
      <li>
        Separate each flag with a <span className="font-semibold">space</span> (e.g. <code> -verbose -nowarn</code>).
      </li>
      <li>
        <span className="font-semibold">No need</span> to re-specify the input and output files here.
      </li>
    </ul>
  </InfoTooltip>
));
FlagsTooltip.displayName = "FlagsTooltip";

export default CompileSettings;
