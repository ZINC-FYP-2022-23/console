import Button from "@/components/Button";
import { TagsInput, Textarea, TextInput } from "@/components/Input";
import { cFamilyCompileDefault } from "@/constants/GuiBuilder/supportedLanguages";
import { useQueryParameters, useSelectedStageConfig, useSelectedStageDiagnostics } from "@/hooks/GuiBuilder";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { Diagnostic } from "@/types/GuiBuilder";
import { getSettingsLangLabel } from "@/utils/GuiBuilder";
import { getCompilePreviewCommand } from "@/utils/GuiBuilder/stageConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FocusEventHandler, memo } from "react";
import { DeepReadonly } from "utility-types";
import { Alert, InfoTooltip } from "../Diagnostics";
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
      <UnsupportedLangAlert />
      <div className="flex gap-3">
        <label htmlFor="input" className="mt-2 flex-1">
          Input files <span className="text-red-600 text-xs">(required)</span>
        </label>
        <TagsInput
          id="input"
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
          id="additional_packages"
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

/**
 * Alert to show when the language specified in `_settings.lang` does not require compilation (e.g. Python).
 */
function UnsupportedLangAlert() {
  const { updateStep } = useQueryParameters();
  const [diagnostics] = useSelectedStageDiagnostics();

  const lang = useStoreState((state) => state.config.editingConfig._settings.lang);
  const setElementToHighlight = useStoreActions((actions) => actions.layout.setElementToHighlight);
  const setModal = useStoreActions((actions) => actions.layout.setModal);

  const langLabel = getSettingsLangLabel(lang);

  const isUnsupportedLangError = (d: Diagnostic) =>
    !d.resolved && d.type === "INVALID_FIELD_ERROR" && d.fields?.includes("_settings.lang");

  return diagnostics.some(isUnsupportedLangError) ? (
    <Alert severity="error">
      <div>
        <p>
          This stage is <span className="font-semibold">not supported</span> by the language of this assignment
          {langLabel ? ` (${langLabel})` : ""}.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button
            icon={<FontAwesomeIcon icon={["far", "trash-can"]} />}
            onClick={() => setModal({ path: "deleteStage", value: true })}
            className="bg-red-500 text-sm text-white hover:bg-red-600"
          >
            Delete this stage
          </Button>
          <Button
            icon={<FontAwesomeIcon icon={["fas", "edit"]} />}
            onClick={() => {
              updateStep("settings");
              setElementToHighlight("lang");
            }}
            className="bg-cse-600 text-sm text-white hover:bg-cse-500 active:bg-cse-400"
          >
            Change language
          </Button>
        </div>
      </div>
    </Alert>
  ) : null;
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
