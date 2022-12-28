import { Checkbox, Select, SwitchGroup, TextInput } from "@components/Input";
import ListInput from "@components/Input/ListInput";
import { ACCEPTED_LANG } from "@constants/Config/AcceptedLang";
import supportedStages from "@constants/Config/supportedStages";
import { useStoreActions, useStoreState } from "@state/GuiBuilder/Hooks";
import { SettingsFeatures, SettingsGpuDevice, SettingsUseTemplate } from "@types";
import { settingsLangToString } from "@utils/Config";
import { memo } from "react";
import { v4 as uuidv4 } from "uuid";
import InfoTooltip from "../Diagnostics/InfoTooltip";

interface UseTemplateSelectOptions {
  label: string;
  value: "undefined" | SettingsUseTemplate;
}

const useTemplateSelectOptions: UseTemplateSelectOptions[] = [
  { label: "None", value: "undefined" },
  { label: "Text input", value: SettingsUseTemplate.FILENAMES },
  { label: "File upload", value: SettingsUseTemplate.PATH },
];

interface GpuSelectOptions {
  label: string;
  value: "undefined" | "ANY" | "choose";
}

const gpuSelectOptions: GpuSelectOptions[] = [
  { label: "None", value: "undefined" },
  { label: "Any GPU", value: "ANY" },
  { label: "Choose vendors", value: "choose" },
];

const getGpuSelectValue = (gpu: SettingsFeatures["gpu_device"]): GpuSelectOptions["value"] => {
  if (gpu === undefined) {
    return "undefined";
  } else if (gpu === "ANY") {
    return "ANY";
  } else {
    return "choose";
  }
};

const gpuVendorSelectOptions = [
  { label: "NVIDIA", value: SettingsGpuDevice.NVIDIA },
  { label: "AMD", value: SettingsGpuDevice.AMD },
  { label: "Intel", value: SettingsGpuDevice.INTEL },
];

function PipelineSettings() {
  const _settings = useStoreState((state) => state.editingConfig._settings);
  const updateField = useStoreActions((actions) => actions.updateField);

  return (
    <div className="flex flex-col gap-8 text-sm">
      {/* Language */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Language</h3>
        <div className="flex items-center gap-3">
          <Select
            extraClassNames="grow"
            onChange={(event) => {
              const values = event.target.value.split("/");
              const language = values[0];
              const compiler = values.length > 1 ? values[1] : null;
              updateField({ path: "_settings.lang.language", value: language });
              updateField({ path: "_settings.lang.compiler", value: compiler });
            }}
            defaultValue={settingsLangToString(_settings.lang).split(":")[0]}
          >
            {ACCEPTED_LANG.map(({ lang, label }) => (
              <option key={lang} value={lang}>
                {label}
              </option>
            ))}
          </Select>
          <span className="flex-none text-gray-500">version</span>
          <TextInput
            value={_settings.lang.version}
            onChange={(event) => {
              const value = event.target.value;
              updateField({ path: "_settings.lang.version", value });
            }}
            classNames={{ root: "flex-1" }}
          />
          <LangVersionTooltip />
        </div>
      </div>
      {/* Helper Files */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Helper Files</h3>
        <div className="flex flex-col gap-5">
          <SwitchGroup
            label="Provide skeleton code to students"
            checked={_settings.use_skeleton}
            onChange={(value) => {
              updateField({ path: "_settings.use_skeleton", value });
            }}
          />
          <SwitchGroup
            label="Use driver programs for grading"
            checked={_settings.use_provided}
            onChange={(value) => {
              updateField({ path: "_settings.use_provided", value });
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <div className="pr-2 flex-none w-1/2 flex items-center gap-1">
                <label htmlFor="use_template">Specify files that students should submit</label>
                <UseTemplateTooltip />
              </div>
              <Select
                id="use_template"
                extraClassNames="w-full"
                onChange={(event) => {
                  const value = event.target.value as UseTemplateSelectOptions["value"];
                  updateField({ path: "_settings.use_template", value: value === "undefined" ? undefined : value });
                }}
                value={_settings.use_template ?? "undefined"}
              >
                {useTemplateSelectOptions.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            {_settings.use_template === SettingsUseTemplate.FILENAMES && (
              <div className="mt-4 mx-3 p-3 bg-gray-50 rounded-lg drop-shadow">
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
                        updateField({ path: "_settings.template", value: newTemplate });
                      }}
                      onEnterKeyPressed={() => {
                        const newTemplate = [..._settings.template];
                        newTemplate.splice(index + 1, 0, { id: uuidv4(), name: "" });
                        updateField({ path: "_settings.template", value: newTemplate });
                      }}
                      onDelete={() => {
                        const newTemplate = _settings.template.filter((f) => f.id !== file.id);
                        updateField({ path: "_settings.template", value: newTemplate });
                      }}
                    />
                  ))}
                  <ListInput.AddButton
                    onClick={() => {
                      const newTemplate = [..._settings.template, { id: uuidv4(), name: "" }];
                      updateField({ path: "_settings.template", value: newTemplate });
                    }}
                  />
                </ListInput>
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
            label="Early return on error (Experimental)"
            description="Whether the pipeline will abort when any stage returns a non-zero exit code"
            checked={_settings.early_return_on_throw}
            onChange={(value) => {
              updateField({ path: "_settings.early_return_on_throw", value });
            }}
          />
          <SwitchGroup
            label="Allow Internet access for all stages"
            checked={_settings.enable_features.network}
            onChange={(value) => {
              updateField({ path: "_settings.enable_features.network", value });
            }}
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex-none w-1/2 flex items-center gap-1">
                <label htmlFor="stage_wait_duration_secs">Max. stage execution time</label>
                <StageWaitDurationTooltip />
              </div>
              <div className="flex-1 flex items-center">
                <TextInput
                  id="stage_wait_duration_secs"
                  value={_settings.stage_wait_duration_secs}
                  type="number"
                  min="0"
                  placeholder="60"
                  onChange={(event) => {
                    const value = event.target.value;
                    updateField({ path: "_settings.stage_wait_duration_secs", value });
                  }}
                  classNames={{ root: "flex-1" }}
                />
                <span className="ml-3 flex-none text-gray-500">secs</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-none w-1/2 flex items-center gap-1">
                <label htmlFor="cpus">CPUs</label>
                <CpusTooltip />
              </div>
              <TextInput
                id="cpus"
                value={_settings.cpus}
                type="number"
                step=".1"
                min="1"
                placeholder="2.0"
                onChange={(event) => {
                  const value = event.target.value;
                  updateField({ path: "_settings.cpus", value });
                }}
                classNames={{ root: "flex-1" }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-none w-1/2 flex items-center gap-1">
                  <label htmlFor="gpus">GPU</label>
                  <GpuTooltip />
                </div>
                <Select
                  id="gpus"
                  extraClassNames="w-full"
                  onChange={(event) => {
                    const value = event.target.value as GpuSelectOptions["value"];
                    let gpuDevice: SettingsFeatures["gpu_device"];
                    switch (value) {
                      case "undefined":
                        gpuDevice = undefined;
                        break;
                      case "ANY":
                        gpuDevice = "ANY";
                        break;
                      case "choose":
                        gpuDevice = [];
                        break;
                    }
                    updateField({ path: "_settings.enable_features.gpu_device", value: gpuDevice });
                  }}
                  value={getGpuSelectValue(_settings.enable_features.gpu_device)}
                >
                  {gpuSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
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
                              updateField({ path: "_settings.enable_features.gpu_device", value: gpuDevices });
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
              <div className="flex-none w-1/2 flex items-center gap-1">
                <label htmlFor="mem_gb">Memory</label>
                <MemoryTooltip />
              </div>
              <div className="flex-1 flex items-center">
                <TextInput
                  id="mem_gb"
                  value={_settings.mem_gb}
                  type="number"
                  step=".1"
                  min="1"
                  placeholder="4.0"
                  onChange={(event) => {
                    const value = event.target.value;
                    updateField({ path: "_settings.mem_gb", value });
                  }}
                  classNames={{ root: "flex-1" }}
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
  const setStep = useStoreActions((actions) => actions.setStep);
  const setAccordion = useStoreActions((actions) => actions.setAccordion);
  const setAddStageSearchString = useStoreActions((actions) => actions.setAddStageSearchString);

  return (
    <InfoTooltip width={520}>
      <ul className="px-3 list-disc">
        <li>
          <span className="font-semibold">None: </span>
          Does not check what files students should submit
        </li>
        <li>
          <span className="font-semibold">Text input: </span>
          Input the names of the files to submit
        </li>
        <li>
          <span className="font-semibold">File upload: </span>
          Specify files to submit by{" "}
          <button onClick={() => setStep("upload")} className="underline text-blue-700">
            uploading files
          </button>{" "}
        </li>
      </ul>
      <p className="mt-2">
        To perform the actual checking, add the &quot;
        <span className="font-semibold">File Structure Validation</span>&quot; stage in your{" "}
        <button
          onClick={() => {
            setStep("pipeline");
            setAccordion({ path: "addNewStage", value: ["preCompile"] });
            setAddStageSearchString(supportedStages.FileStructureValidation.label);
          }}
          className="underline text-blue-700"
        >
          grading pipeline
        </button>
        .
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
