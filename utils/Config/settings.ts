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
  const _settings = { ...settings, lang: settingsLangToString(settings.lang) };

  // Recursively convert fields with value `undefined` to `null` as js-yaml cannot parse `undefined` fields
  const _settingsStr = JSON.stringify(_settings, (_, v) => (v === undefined ? null : v));
  return JSON.parse(_settingsStr);
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
  // Deep clone to prevent modifying the original settings
  const _this = cloneDeep(s1);
  const other = cloneDeep(s2);

  // Convert to number for fields of type `number | string`
  if (typeof other.stage_wait_duration_secs === "string") {
    other.stage_wait_duration_secs = parseInt(other.stage_wait_duration_secs);
  }
  if (typeof other.cpus === "string") {
    other.cpus = parseFloat(other.cpus);
  }
  if (typeof other.mem_gb === "string") {
    other.mem_gb = parseFloat(other.mem_gb);
  }

  // Sort GPU devices array (if it is array) to facilitate comparison
  if (Array.isArray(_this.enable_features.gpu_device)) {
    _this.enable_features.gpu_device.sort();
  }
  if (Array.isArray(other.enable_features.gpu_device)) {
    other.enable_features.gpu_device.sort();
  }

  return isEqual(_this, other);
}
