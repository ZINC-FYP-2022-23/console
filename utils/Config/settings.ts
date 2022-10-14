/**
 * @file Utilities for the `Settings` type.
 */

import type { ParsedConfig, Settings, SettingsLang } from "@types";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

/**
 * Converts to an object representation of the `_settings` field in the configuration YAML.
 */
export function settingsToYamlObj(settings: Settings): ParsedConfig["_settings"] {
  const tidiedSettings = tidySettings(settings);
  const _settings = { ...tidiedSettings, lang: settingsLangToString(tidiedSettings.lang) };

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

  // Convert to number for fields of type `number | string`
  if (typeof s.stage_wait_duration_secs === "string") {
    s.stage_wait_duration_secs = parseInt(s.stage_wait_duration_secs);
  }
  if (typeof s.cpus === "string") {
    s.cpus = parseFloat(s.cpus);
  }
  if (typeof s.mem_gb === "string") {
    s.mem_gb = parseFloat(s.mem_gb);
  }

  // Sort GPU devices array (if it is array)
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
  const _s1 = tidySettings(s1);
  const _s2 = tidySettings(s2);
  return isEqual(_s1, _s2);
}
