import { Checkbox, Select, SwitchGroup, TextInput } from "components/Input";
import { ACCEPTED_LANG } from "constants/Config/AcceptedLang";
import { useState } from "react";
import { useStoreActions, useStoreState } from "state/Config/Hooks";
import { SettingsFeatures, SettingsGpuDevice } from "types";

interface GpuSelectOptions {
  label: string;
  value: "undefined" | "ANY" | "choose";
}

const gpuSelectOptions: GpuSelectOptions[] = [
  { label: "None", value: "undefined" },
  { label: "Any GPU", value: "ANY" },
  { label: "Choose vendors...", value: "choose" },
];

const gpuVendorSelectOptions = [
  { label: "NVIDIA", value: SettingsGpuDevice.NVIDIA },
  { label: "AMD", value: SettingsGpuDevice.AMD },
  { label: "Intel", value: SettingsGpuDevice.INTEL },
];

function GeneralSettings() {
  const _settings = useStoreState((state) => state.editingConfig._settings);
  const updateField = useStoreActions((actions) => actions.updateField);

  // Subset of _settings. The fields below are all text input fields.
  // This is required because if we pass `_settings` fields to the `value` prop of input fields directly
  // (e.g. `value={_settings.cpus}`), the input field does not update when the user types in it.
  const [settings, setSettings] = useState({
    langVersion: _settings.lang?.version,
    use_skeleton: _settings.use_skeleton,
    use_provided: _settings.use_provided,
    stage_wait_duration_secs: _settings.stage_wait_duration_secs.toString(),
    cpus: _settings.cpus.toString(),
    mem_gb: _settings.mem_gb.toString(),
    early_return_on_throw: _settings.early_return_on_throw,
    network: _settings.enable_features.network,
    gpu_device: _settings.enable_features.gpu_device,
  });

  // TODO: Numerical fields in `_settings` casted back to numbers, not strings

  return (
    <div className="flex flex-col gap-8">
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
            defaultValue={_settings.lang?.toString().split(":")[0]}
          >
            {ACCEPTED_LANG.map(({ lang, label }) => (
              <option key={lang} value={lang}>
                {label}
              </option>
            ))}
          </Select>
          <span className="flex-none text-gray-500">version</span>
          <TextInput
            extraClassNames="grow w-20"
            value={settings.langVersion}
            onChange={(event) => {
              const value = event.target.value;
              setSettings({ ...settings, langVersion: value });
              updateField({ path: "_settings.lang.version", value });
            }}
          />
        </div>
      </div>
      {/* Helper Files */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Helper Files</h3>
        <div className="flex flex-col gap-5">
          <SwitchGroup
            label="Provide skeleton code to students"
            checked={settings.use_skeleton}
            onChange={(value) => {
              setSettings({ ...settings, use_skeleton: value });
              updateField({ path: "_settings.use_skeleton", value });
            }}
          />
          <SwitchGroup
            label="Use driver programs for grading"
            checked={settings.use_provided}
            onChange={(value) => {
              setSettings({ ...settings, use_provided: value });
              updateField({ path: "_settings.use_provided", value });
            }}
          />
          <SwitchGroup
            label="Use template helper files"
            description="Files that students should submit"
            checked={false}
            onChange={(value) => {
              // TODO: Handle template helper files
              console.log(value);
            }}
          />
        </div>
      </div>
      {/* Stage Settings */}
      <div>
        <h3 className="mb-3 font-semibold text-base">Stage Settings</h3>
        <div className="flex flex-col gap-5">
          <SwitchGroup
            label="Early return on error"
            description="Whether the pipeline will return when any stage returns non-zero exit code"
            checked={settings.early_return_on_throw}
            onChange={(value) => {
              setSettings({ ...settings, early_return_on_throw: value });
              updateField({ path: "_settings.early_return_on_throw", value });
            }}
          />
          <SwitchGroup
            label="Allow Internet access"
            checked={settings.network}
            onChange={(value) => {
              setSettings({ ...settings, network: value });
              updateField({ path: "_settings.enable_features.network", value });
            }}
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="stage_wait_duration_secs" className="flex-none w-1/2">
                Max. stage execution time
              </label>
              <div className="flex-1 flex items-center">
                <TextInput
                  id="stage_wait_duration_secs"
                  value={settings.stage_wait_duration_secs}
                  type="number"
                  min="0"
                  placeholder="60"
                  onChange={(event) => {
                    const value = event.target.value;
                    setSettings({ ...settings, stage_wait_duration_secs: value });
                    updateField({ path: "_settings.stage_wait_duration_secs", value });
                  }}
                  extraClassNames="flex-1 w-10"
                />
                <span className="ml-3 flex-none text-gray-500">secs</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="cpus" className="flex-none w-1/2">
                CPUs
              </label>
              <TextInput
                id="cpus"
                value={settings.cpus}
                type="number"
                step=".1"
                min="1"
                placeholder="2.0"
                onChange={(event) => {
                  const value = event.target.value;
                  updateField({ path: "_settings.cpus", value });
                  setSettings({ ...settings, cpus: value });
                }}
                extraClassNames="flex-1 w-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="mem_gb" className="flex-none w-1/2">
                Memory
              </label>
              <div className="flex-1 flex items-center">
                <TextInput
                  id="mem_gb"
                  value={settings.mem_gb}
                  type="number"
                  step=".1"
                  min="1"
                  placeholder="4.0"
                  onChange={(event) => {
                    const value = event.target.value;
                    updateField({ path: "_settings.mem_gb", value });
                    setSettings({ ...settings, mem_gb: value });
                  }}
                  extraClassNames="flex-1 w-10"
                />
                <span className="ml-3 flex-none text-gray-500">GB</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="cpus" className="flex-none w-1/2">
                  GPU device
                </label>
                <Select
                  id="cpus"
                  extraClassNames="flex-1"
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
                    setSettings({ ...settings, gpu_device: gpuDevice });
                    updateField({ path: "_settings.enable_features.gpu_device", value: gpuDevice });
                  }}
                >
                  {gpuSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              {Array.isArray(settings.gpu_device) && (
                <div className="max-w-sm mt-4 mx-auto px-3 flex justify-between">
                  {gpuVendorSelectOptions.map(({ label, value }) => {
                    return (
                      <div key={value} className="flex items-center">
                        <Checkbox
                          id={value}
                          checked={(settings.gpu_device as SettingsGpuDevice[]).includes(value)}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            const gpuDevices = [...(settings.gpu_device as SettingsGpuDevice[])];
                            if (checked) {
                              gpuDevices.push(value);
                            } else {
                              gpuDevices.splice(gpuDevices.indexOf(value), 1);
                            }
                            setSettings({ ...settings, gpu_device: gpuDevices });
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;