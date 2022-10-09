/**
 * @file Utilities for the `Settings` type.
 */

import type { ParsedConfig, Settings, SettingsLang } from "types";

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
