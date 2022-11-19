/**
 * @file Utilities for the `Settings` type.
 */

import { defaultSettings } from "@constants/Config/defaults";
import type { Settings, SettingsLang, SettingsRaw } from "@types";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";

/**
 * Converts a raw settings object to a {@link Settings} object.
 * @param sr The raw settings object obtained from parsing the YAML's `_settings` field.
 */
export function settingsRawToSettings(sr: SettingsRaw): Settings {
  return {
    lang: parseLangString(sr.lang),
    use_template: sr.use_template ?? undefined,
    template: sr.template?.map((t) => ({ id: uuidv4(), name: t })) ?? defaultSettings.template,
    use_skeleton: sr.use_skeleton ?? defaultSettings.use_skeleton,
    use_provided: sr.use_provided ?? defaultSettings.use_provided,
    stage_wait_duration_secs: sr.stage_wait_duration_secs?.toString() ?? "",
    cpus: sr.cpus?.toString() ?? "",
    mem_gb: sr.mem_gb?.toString() ?? "",
    early_return_on_throw: sr.early_return_on_throw ?? defaultSettings.early_return_on_throw,
    enable_features: {
      network: sr.enable_features?.network ?? defaultSettings.enable_features.network,
      gpu_device: sr.enable_features?.gpu_device ?? defaultSettings.enable_features.gpu_device,
    },
  };
}

/**
 * Converts a {@link Settings} object to a raw settings object to be de-serialized to YAML.
 */
export function settingsToSettingsRaw(settings: Settings): SettingsRaw {
  const s = tidySettings(settings);

  const _settings: SettingsRaw = {
    ...s,
    lang: settingsLangToString(s.lang),
    template: s.template.map((t) => t.name),
    stage_wait_duration_secs: parseInt(s.stage_wait_duration_secs),
    cpus: parseFloat(s.cpus),
    mem_gb: parseFloat(s.mem_gb),
  };

  // Recursively convert fields with value `undefined` to `null` as js-yaml cannot parse `undefined` fields
  const _settingsStr = JSON.stringify(_settings, (_, v) => (v === undefined ? null : v));
  return JSON.parse(_settingsStr);
}

/**
 * Tidies up a `Settings` object to facilitate de-serialization or comparison in the future.
 * @param settings The settings to tidy up. This object will NOT be modified.
 * @returns A cloned copy of the `settings` argument that is tidied up.
 */
export function tidySettings(settings: Settings): Settings {
  const s = cloneDeep(settings);

  s.lang.version = s.lang.version.trim();
  s.template = s.template.map((t) => ({ id: t.id, name: t.name.trim() })).filter((t) => t.name !== "");
  if (Array.isArray(s.enable_features.gpu_device)) {
    s.enable_features.gpu_device.sort();
  }

  return s;
}

/**
 * Creates a {@link SettingsLang} instance from the `_settings.lang` string (e.g. `"cpp/g++:8"`).
 * @param lang It's assumed to be correctly formatted.
 */
export function parseLangString(lang: string): SettingsLang {
  const langRegex = /(.+?)(?:\/(.*))?:(.+)/g;
  const groups = langRegex.exec(lang);
  if (groups === null) {
    throw new Error("Invalid format for `_settings.lang` string");
  }
  return {
    language: groups[1],
    compiler: groups[2] || null,
    version: groups[3],
  };
}

/**
 * De-serializes an {@link SettingsLang} instance to a string (e.g. `"cpp/g++:8"`).
 */
export function settingsLangToString(s: SettingsLang): string {
  const { language, compiler, version } = s;
  return `${language}${compiler ? `/${compiler}` : ""}:${version}`;
}

/**
 * Deep compares two `Settings` objects.
 */
export function isSettingsEqual(s1: Settings, s2: Settings): boolean {
  const { template: template1, ..._s1 } = tidySettings(s1);
  const { template: template2, ..._s2 } = tidySettings(s2);

  const _template1 = template1.map((t) => t.name).sort();
  const _template2 = template2.map((t) => t.name).sort();

  return isEqual(_s1, _s2) && isEqual(_template1, _template2);
}
