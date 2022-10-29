/**
 * @file Utilities for the `Config` type.
 */

import type { Config, ParsedConfig } from "@types";
import { dump, load } from "js-yaml";
import isEqual from "lodash/isEqual";
import { isSettingsEqual, settingsRawToSettings, settingsToSettingsRaw } from "./settings";
import { isStageDependencyEqual, parseStages, stagesToYamlObj } from "./stage";

/**
 * Creates a {@link Config} object from parsing the configuration YAML.
 * @param yaml It's assumed that the YAML has already been validated by the grader.
 */
export function parseConfigYaml(yaml: string): Config {
  const { _settings: settingsRaw, ...stagesRaw } = load(yaml) as ParsedConfig;
  const _settings = settingsRawToSettings(settingsRaw);
  const [stageDeps, stageData] = parseStages(stagesRaw);
  return { _settings, stageDeps, stageData };
}

/**
 * De-serializes a {@link Config} object to a YAML string.
 */
export function configToYaml(config: Config): string {
  const _settings = settingsToSettingsRaw(config._settings);
  const stages = stagesToYamlObj(config.stageDeps, config.stageData);
  return dump({ _settings, ...stages });
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
