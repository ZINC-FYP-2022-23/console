interface AcceptedLang {
  language: string;
  compiler?: string[];
  /**
   * Displayed name in the UI.
   *
   * If undefined, the display name will default to capitalized value of the `language` field.
   */
  displayName?: string;
}

/**
 * Accepted languages for the `_settings.lang` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-lang}
 */
export const ACCEPTED_LANG: AcceptedLang[] = [
  {
    language: "c",
    compiler: ["gcc", "clang"],
  },
  {
    language: "cpp",
    compiler: ["g++", "clang++"],
    displayName: "C++",
  },
  {
    language: "java",
  },
  {
    language: "python",
    compiler: ["", "cuda"],
  },
  {
    language: "qt5",
    displayName: "C++ with Qt",
  },
];
