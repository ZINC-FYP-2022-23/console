/**
 * @file Utilities for the `Config` type.
 */

import { Config, ConfigRaw } from "@/types/GuiBuilder";
import { dump, load } from "js-yaml";
import isEqual from "lodash/isEqual";
import { isSettingsEqual, settingsRawToSettings, settingsToSettingsRaw } from "./settings";
import { isStageDependencyEqual, parseStages, stagesToYamlObj } from "./stage";

/**
 * Creates a {@link Config} object from parsing the configuration YAML.
 * @param yaml It's assumed that the YAML has already been validated by the grader.
 */
export function parseConfigYaml(yaml: string): Config {
  const parsedYaml = load(yaml);

  // Recursively convert fields with value `null` to `undefined`. This makes it easier to model the YAML
  // schema with TypeScript type definitions because we can simply mark nullable fields with `?:` operator
  // instead of `| null`.
  const configRaw = JSON.parse(JSON.stringify(parsedYaml), (_, v) => (v === null ? undefined : v)) as ConfigRaw;

  const { _settings: settingsRaw, ...stagesRaw } = configRaw;
  const _settings = settingsRawToSettings(settingsRaw);
  const [stageDeps, stageData] = parseStages(stagesRaw);

  return { _settings, stageDeps, stageData };
}

/**
 * De-serializes a {@link Config} object to a YAML string.
 * @param settingsOnly Whether to only serialize settings such that the output YAML only has a `_settings` key.
 */
export function configToYaml(config: Config, settingsOnly = false): string {
  const input = {
    _settings: settingsToSettingsRaw(config._settings),
    ...(settingsOnly ? {} : stagesToYamlObj(config.stageDeps, config.stageData)),
  };

  // Recursively convert fields with value `undefined` to `null` as js-yaml cannot parse `undefined` fields
  const outputObjString = JSON.stringify(input, (_, v) => (v === undefined ? null : v));
  return dump(JSON.parse(outputObjString));
}

/**
 * Deep compares two `Config` objects.
 */
export function isConfigEqual(c1: Config, c2: Config): boolean {
  return (
    isSettingsEqual(c1._settings, c2._settings) &&
    isEqual(c1.stageData, c2.stageData) &&
    isStageDependencyEqual(c1.stageDeps, c2.stageDeps)
  );
}
