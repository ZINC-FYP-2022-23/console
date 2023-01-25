import { TagsInput, Textarea, TextInput } from "@/components/Input";
import { useSelectedStageConfig } from "@/hooks/GuiBuilder";
import { useStoreState } from "@/store/GuiBuilder";
import { Compile } from "@/types";
import { FocusEventHandler, memo } from "react";
import { InfoTooltip } from "../Diagnostics";
import { AdditionalPackagesTooltip } from "./common";

interface ConfigMetadata {
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
}

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
        output: { defaultValue: "a.out" },
        flags: { defaultValue: "-std=c++11 -pedantic -Wall -Wextra -g" },
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
  const language = useStoreState((state) => state.config.editingConfig._settings.lang.language);

  if (!config) return null;

  const metadata = getConfigMetadata(language);

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
    <div className="p-3 space-y-4">
      <div className="flex items-center">
        <label htmlFor="input" className="w-1/3">
          Input files
        </label>
        <TagsInput
          name="input"
          value={config.input}
          onChange={(tags) => setConfig({ ...config, input: tags })}
          onBlur={onTagInputBlur("input")}
          placeHolder={config.input.length === 0 ? metadata.input.placeholder : ""}
          className="flex-1 font-mono text-sm"
        />
      </div>
      <div className="flex items-center">
        <label htmlFor="output" className="w-1/3">
          Output file name
        </label>
        <TextInput
          id="output"
          value={metadata.output.disabled ? "" : config.output ?? ""}
          onChange={(e) => setConfig({ ...config, output: e.target.value })}
          placeholder={metadata.output.disabled ? "No need to specify" : metadata.output.defaultValue}
          disabled={metadata.output.disabled}
          classNames={{ root: "flex-1", input: "font-mono placeholder:disabled:font-sans" }}
        />
      </div>
      <div className="flex items-center">
        <div className="w-1/3 flex items-center gap-1">
          <label htmlFor="flags">Command-line flags</label>
          <FlagsTooltip />
        </div>
        <Textarea
          id="flags"
          value={config.flags ?? ""}
          onChange={(e) => setConfig({ ...config, flags: e.target.value })}
          placeholder={metadata.flags.defaultValue ?? "e.g. -verbose -nowarn"}
          monospace
          styles={{ root: { flex: 1 } }}
        />
      </div>
      <div className="flex items-center">
        <div className="w-1/3 flex items-center gap-1">
          <label htmlFor="additional_packages">Additional packages</label>
          <AdditionalPackagesTooltip />
        </div>
        <TagsInput
          name="additional_packages"
          value={config.additional_packages}
          onChange={(tags) => setConfig({ ...config, additional_packages: tags })}
          onBlur={onTagInputBlur("additional_packages")}
          placeHolder={config.additional_packages.length === 0 ? "e.g. curl" : ""}
          className="flex-1 font-mono text-sm"
        />
      </div>
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
        <span className="font-semibold">No need</span> to re-specify the output file here.
      </li>
    </ul>
  </InfoTooltip>
));
FlagsTooltip.displayName = "FlagsTooltip";

export default CompileSettings;
