/**
 * @file Utilities for the `Config` type.
 */

import type { Config, ParsedConfig, Settings, Stage } from "@types";
import { dump, load } from "js-yaml";
import isEqual from "lodash/isEqual";
import { isSettingsEqual, parseLangString, settingsToYamlObj } from "./settings";
import { parseStages, stagesToYamlObj } from "./stage";

/**
 * Creates a {@link Config} object from parsing the configuration YAML.
 * @param yaml It's assumed that the YAML has already been validated by the grader.
 */
export function parseConfigYaml(yaml: string): Config {
  const { _settings: settingsRaw, ...stagesRaw } = load(yaml) as ParsedConfig;
  const _settings: Settings = { ...settingsRaw, lang: parseLangString(settingsRaw.lang) };
  const stages: Stage[] = parseStages(stagesRaw);
  return { _settings, stages };
}

/**
 * De-serializes a {@link Config} object to a YAML string.
 */
export function configToYaml(config: Config): string {
  const _settings = settingsToYamlObj(config._settings);
  const stages = stagesToYamlObj(config.stages);
  return dump({ _settings, ...stages });
}

/**
 * Deep compares two `Config` objects.
 */
export function isConfigEqual(c1: Config, c2: Config): boolean {
  return isSettingsEqual(c1._settings, c2._settings) && isEqual(c1.stages, c2.stages);
}
