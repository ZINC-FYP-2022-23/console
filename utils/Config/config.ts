/**
 * @file Utilities for the `Config` type.
 */

import { dump, load } from "js-yaml";
import type { Config, ParsedConfig, Settings, Stage } from "types";
import { parseLangString, settingsToYamlObj } from "./settings";

/**
 * Creates a {@link Config} object from parsing the configuration YAML.
 * @param yaml It's assumed that the YAML has already been validated by the grader.
 */
export function parseConfigYaml(yaml: string): Config {
  const { _settings: settingsRaw, ...stagesRaw } = load(yaml) as ParsedConfig;
  const _settings: Settings = { ...settingsRaw, lang: parseLangString(settingsRaw.lang) };
  const stages: Stage[] = Object.entries(stagesRaw).map(([id, config]) => ({ id, config }));
  return { _settings, stages };
}

/**
 * De-serializes a {@link Config} object to a YAML string.
 */
export function configToYaml(config: Config): string {
  const _settings = settingsToYamlObj(config._settings);
  const stages = {};
  config.stages.forEach((stage) => (stages[stage.id] = stage.config));
  return dump({ _settings, ...stages });
}
