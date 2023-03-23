/**
 * @file Utilities for the `Config` type.
 */

import { Config, ConfigRaw } from "@/types/GuiBuilder";
import { dump, load } from "js-yaml";
import isEqual from "lodash/isEqual";
import { nullToUndefined, undefinedToNull } from "../object";
import { isSettingsEqual, settingsRawToSettings, settingsToSettingsRaw } from "./settings";
import { isStageDependencyEqual, parseStages, stagesToYamlObj } from "./stage";

/**
 * Creates a {@link Config} object from parsing the configuration YAML.
 * @param yaml It's assumed that the YAML has already been validated by the grader.
 */
export function parseConfigYaml(yaml: string): Config {
  const parsedYaml = load(yaml);
  const configRaw = nullToUndefined(parsedYaml) as ConfigRaw;

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
  const outputConfig = undefinedToNull(input);
  return dump(outputConfig);
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
