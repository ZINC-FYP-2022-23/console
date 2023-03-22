import { Checkbox, NumberInput, Select, SelectItem, SwitchGroup, TextInput } from "@/components/Input";
import ListInput from "@/components/Input/ListInput";
import { highlightableElementIds } from "@/constants/GuiBuilder/highlightableElements";
import supportedLanguages from "@/constants/GuiBuilder/supportedLanguages";
import { useStoreActions, useStoreState } from "@/store/GuiBuilder";
import { SettingsFeatures, SettingsGpuDevice, SettingsUseTemplate } from "@/types/GuiBuilder";
import { settingsLangToString } from "@/utils/GuiBuilder";
import { memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { InfoTooltip } from "../Diagnostics";

const langSelectOptions: SelectItem[] = supportedLanguages.map(({ language, compiler, label }) => ({
  value: `${language}${compiler ? `/${compiler}` : ""}`,
  label,
}));

const useTemplateSelectOptions: SelectItem<"undefined" | SettingsUseTemplate>[] = [
  {
    label: "None",
    value: "undefined",
    description: "Does not check what files students should submit",
  },
  {
    label: "Text input",
    value: SettingsUseTemplate.FILENAMES,
    description: "Input the names of the files to submit",
  },
  {
    label: "File upload",
    value: SettingsUseTemplate.PATH,
    description: "Specify files to submit by uploading files",
  },
];

type GpuSelectValue = "undefined" | "ANY" | "choose";

const gpuSelectOptions: SelectItem<GpuSelectValue>[] = [
  { label: "None", value: "undefined" },
  { label: "Any GPU", value: "ANY" },
  { label: "Choose vendors", value: "choose" },
];

const getGpuSelectValue = (gpu: SettingsFeatures["gpu_device"]): GpuSelectValue => {
  if (gpu === undefined) {
    return "undefined";
  } else if (gpu === "ANY") {
    return "ANY";
  } else {
    return "choose";
  }
};

const gpuSelectValueToGpuDevice = (value: GpuSelectValue): SettingsFeatures["gpu_device"] => {
  switch (value) {
    case "undefined":
      return undefined;
    case "ANY":
      return "ANY";
    case "choose":
      return [];
  }
};

const gpuVendorSelectOptions = [
  { label: "NVIDIA", value: SettingsGpuDevice.NVIDIA },
  { label: "AMD", value: SettingsGpuDevice.AMD },
  { label: "Intel", value: SettingsGpuDevice.INTEL },
];

function PipelineSettings() {
  const _settings = useStoreState((state) => state.config.editingConfig._settings);
  const updateSettings = useStoreActions((actions) => actions.config.updateSettings);

  return (
    <div className="px-1 flex flex-col gap-8 text-sm">
      {/* Language */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Language</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label htmlFor="lang" className="flex-1">
              Language (and Compiler)
            </label>
            <Select
              id="lang"
              data={langSelectOptions}
              value={settingsLangToString(_settings.lang).split(":")[0]}
              onChange={(value) => {
                if (value === null) return;
                const values = value.split("/");
                const language = values[0];
                const compiler = values.length > 1 ? values[1] : null;
                updateSettings((_settings) => {
                  _settings.lang.language = language;
                  _settings.lang.compiler = compiler;
                });
              }}
              maxDropdownHeight={320}
              className="flex-[2]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-1">
              <label htmlFor="lang_version">
                Version <span className="text-red-600 text-xs">(required)</span>
              </label>
              <LangVersionTooltip />
            </div>
            <TextInput
              id="lang_version"
              value={_settings.lang.version}
              onChange={(event) => {
                const value = event.target.value;
                updateSettings((_settings) => (_settings.lang.version = value));
              }}
              classNames={{ root: "flex-[2]" }}
            />
          </div>
        </div>
      </div>
      {/* Helper Files */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Helper Files</h3>
        <div className="flex flex-col gap-5">
          <SwitchGroup
            id="use_skeleton"
            label="Provide skeleton code to students"
            checked={_settings.use_skeleton}
            onChange={(value) => {
              updateSettings((_settings) => (_settings.use_skeleton = value));
            }}
          />
          <SwitchGroup
            id="use_provided"
            label="Use additional files for grading"
            checked={_settings.use_provided}
            onChange={(value) => {
              updateSettings((_settings) => (_settings.use_provided = value));
            }}
          />
          <div id={highlightableElementIds.useTemplateWrapper}>
            <div className="mt-4 flex items-center gap-2">
              <div className="pr-2 flex-1 flex items-center gap-1">
                <label htmlFor="use_template">Specify files that students should submit</label>
                <UseTemplateTooltip />
              </div>
              <Select
                id="use_template"
                data={useTemplateSelectOptions}
                value={_settings.use_template ?? "undefined"}
                onChange={(value) => {
                  if (value === null) return;
                  updateSettings((_settings) => {
                    _settings.use_template = value === "undefined" ? undefined : value;
                  });
                }}
                styles={{ root: { flex: 1 } }}
              />
            </div>
            {_settings.use_template === SettingsUseTemplate.FILENAMES && (
              <div id="use-template-filenames" className="mt-4 mx-3 p-3 bg-gray-50 rounded-lg drop-shadow">
                <p className="mb-2 font-medium text-gray-600">Files to submit:</p>
                <ListInput>
                  {_settings.template.map((file, index) => (
                    <ListInput.Item
                      key={file.id}
                      index={index}
                      placeholder="e.g. example/hello.cpp"
                      value={file.name}
                      onChange={(event) => {
                        const newTemplate = [..._settings.template];
                        newTemplate[index].name = event.target.value;
                        updateSettings((_settings) => (_settings.template = newTemplate));
                      }}
                      onNewItemKeyPressed={() => {
                        const newTemplate = [..._settings.template];
                        newTemplate.splice(index + 1, 0, { id: uuidv4(), name: "" });
                        updateSettings((_settings) => (_settings.template = newTemplate));
                      }}
                      onDelete={() => {
                        const newTemplate = _settings.template.filter((f) => f.id !== file.id);
                        updateSettings((_settings) => (_settings.template = newTemplate));
                      }}
                    />
                  ))}
                  <ListInput.AddButton
                    onClick={() => {
                      const newTemplate = [..._settings.template, { id: uuidv4(), name: "" }];
                      updateSettings((_settings) => (_settings.template = newTemplate));
                    }}
                  />
                </ListInput>
              </div>
            )}
            {_settings.use_template === SettingsUseTemplate.PATH && (
              <div className="mt-4 mx-3 p-3 bg-gray-50 drop-shadow rounded-lg space-y-2 text-gray-700">
                <p>To upload your files:</p>
                <ol className="ml-6 list-decimal">
                  <li>
                    Visit the <span className="font-semibold">Upload Files</span> step
                  </li>
                  <li>
                    Upload your files under{" "}
                    <span className="font-medium">&quot;Files that the students need to submit&quot;</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Stage Settings */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Stage Settings</h3>
        <div className="flex flex-col gap-5">
          <SwitchGroup
            id="early_return_on_throw"
            label="Early return on error (Experimental)"
            description="Whether the pipeline will abort when any stage returns a non-zero exit code"
            checked={_settings.early_return_on_throw}
            onChange={(value) => {
              updateSettings((_settings) => (_settings.early_return_on_throw = value));
            }}
          />
          <SwitchGroup
            id="network"
            label="Allow Internet access for all stages"
            checked={_settings.enable_features.network}
            onChange={(value) => {
              updateSettings((_settings) => (_settings.enable_features.network = value));
            }}
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1">
                <label htmlFor="stage_wait_duration_secs">Max. stage execution time</label>
                <StageWaitDurationTooltip />
              </div>
              <div className="flex-1 flex items-center">
                <NumberInput
                  id="stage_wait_duration_secs"
                  value={_settings.stage_wait_duration_secs}
                  min={0}
                  placeholder="60"
                  onChange={(value) => updateSettings((_settings) => (_settings.stage_wait_duration_secs = value))}
                  className="flex-1"
                />
                <span className="ml-3 flex-none text-gray-500">secs</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1">
                <label htmlFor="cpus">CPUs</label>
                <CpusTooltip />
              </div>
              <NumberInput
                id="cpus"
                value={_settings.cpus}
                precision={1}
                step={0.1}
                min={1}
                placeholder="2.0"
                onChange={(value) => updateSettings((_settings) => (_settings.cpus = value))}
                className="flex-1"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1">
                  <label htmlFor="gpus">GPU</label>
                  <GpuTooltip />
                </div>
                <Select
                  id="gpus"
                  data={gpuSelectOptions}
                  value={getGpuSelectValue(_settings.enable_features.gpu_device)}
                  onChange={(value) => {
                    if (value === null) return;
                    const gpuDevice = gpuSelectValueToGpuDevice(value);
                    updateSettings((_settings) => (_settings.enable_features.gpu_device = gpuDevice));
                  }}
                  styles={{ root: { flex: 1 } }}
                />
              </div>
              {Array.isArray(_settings.enable_features.gpu_device) && (
                <div className="mt-4 mb-2 mx-3 p-3 bg-gray-50 rounded-lg drop-shadow">
                  <p className="mb-3 font-medium text-gray-600">Choose GPU vendor(s):</p>
                  <div className="max-w-sm mx-auto flex items-center justify-between">
                    {gpuVendorSelectOptions.map(({ label, value }) => {
                      return (
                        <div key={value} className="flex items-center">
                          <Checkbox
                            id={value}
                            checked={(_settings.enable_features.gpu_device as SettingsGpuDevice[]).includes(value)}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              const gpuDevices = [...(_settings.enable_features.gpu_device as SettingsGpuDevice[])];
                              if (checked) {
                                gpuDevices.push(value);
                              } else {
                                gpuDevices.splice(gpuDevices.indexOf(value), 1);
                              }
                              updateSettings((_settings) => (_settings.enable_features.gpu_device = gpuDevices));
                            }}
                          />
                          <div className="ml-3 text-sm leading-5">
                            <label htmlFor="nvidia" className="text-gray-700">
                              {label}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1">
                <label htmlFor="mem_gb">Memory</label>
                <MemoryTooltip />
              </div>
              <div className="flex-1 flex items-center">
                <NumberInput
                  id="mem_gb"
                  value={_settings.mem_gb}
                  precision={1}
                  step={0.1}
                  min={1}
                  placeholder="2.0"
                  onChange={(value) => updateSettings((_settings) => (_settings.mem_gb = value))}
                  className="flex-1"
                />
                <span className="ml-3 flex-none text-gray-500">GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LangVersionTooltip = memo(() => (
  <InfoTooltip>
    <p>
      Refer to{" "}
      <a
        href="https://docs.zinc.ust.dev/user/writing-config-yaml.html#lang"
        target="_blank"
        rel="noreferrer"
        className="underline text-blue-700"
      >
        the documentation
      </a>{" "}
      for the supported language versions.
    </p>
  </InfoTooltip>
));
LangVersionTooltip.displayName = "LangVersionTooltip";

const UseTemplateTooltip = memo(() => {
  return (
    <InfoTooltip width={520}>
      <p>
        To perform the actual checking, add the &quot;
        <span className="font-semibold">File Structure Validation</span>&quot; stage to your grading pipeline in the{" "}
        <span className="font-semibold">Pipeline Stages</span> step later.
      </p>
    </InfoTooltip>
  );
});
UseTemplateTooltip.displayName = "UseTemplateTooltip";

const StageWaitDurationTooltip = memo(() => (
  <InfoTooltip width={380}>
    <ul className="px-3 list-disc">
      <li>A good estimate is to multiply how long the grading process takes on your local PC by 2~3 times.</li>
      <li>Usually this value is &lt;120 secs. Only go above if your stages require it.</li>
    </ul>
  </InfoTooltip>
));
StageWaitDurationTooltip.displayName = "StageWaitDurationTooltip";

const CpusTooltip = memo(() => (
  <InfoTooltip width={380}>
    <ul className="px-3 list-disc">
      <li>How many cores each stage can use.</li>
      <li>
        Usually it&apos; s set to <code>1.0</code>, unless the pipeline contains stages which can exploit parallelism.
      </li>
    </ul>
    <p className="mt-1">
      Refer to{" "}
      <a
        href="https://docs.zinc.ust.dev/user/writing-config-yaml.html#cpus"
        target="_blank"
        rel="noreferrer"
        className="underline text-blue-700"
      >
        the documentation
      </a>{" "}
      for more info.
    </p>
  </InfoTooltip>
));
CpusTooltip.displayName = "CpusTooltip";

const MemoryTooltip = memo(() => (
  <InfoTooltip width={380}>
    <p>
      Usually it&apos; s set to <code>1.0</code>, unless the pipeline contains stages which require more RAM.
    </p>
  </InfoTooltip>
));
MemoryTooltip.displayName = "MemoryTooltip";

const GpuTooltip = memo(() => (
  <InfoTooltip width={520}>
    <ul className="px-3 list-disc">
      <li>
        <span className="font-semibold">None: </span>
        Do not allocate any GPU.
      </li>
      <li>
        <span className="font-semibold">Any GPU: </span>
        Allocates any GPU available. Note that GPUs exposed as virtual machine devices (e.g. VMWare VGA controller) are
        also considered as viable candidates.
      </li>
      <li>
        <span className="font-semibold">Choose vendors: </span>
        Allocates a GPU from one of the specified vendor(s).
        <ul className="ml-4 list-disc">
          <li>e.g. Pick &apos;NVIDIA&apos; if your pipeline stage requires CUDA.</li>
          <li>Requesting specific models of GPUs is not supported.</li>
        </ul>
      </li>
    </ul>
  </InfoTooltip>
));
GpuTooltip.displayName = "GpuTooltip";

export default PipelineSettings;
