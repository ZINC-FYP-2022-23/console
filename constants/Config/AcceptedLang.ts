interface AcceptedLang {
  /** The language and compiler under the format of `${language}[/${compiler}]`. */
  lang: string;
  /** Label to display in the UI. */
  label: string;
}

/**
 * Accepted languages for the `_settings.lang` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-lang}
 */
export const ACCEPTED_LANG: AcceptedLang[] = [
  { lang: "c/gcc", label: "C (gcc)" },
  { lang: "c/clang", label: "C (clang)" },
  { lang: "cpp/g++", label: "C++ (g++)" },
  { lang: "cpp/clang++", label: "C++ (clang++)" },
  { lang: "java", label: "Java" },
  { lang: "python", label: "Python" },
  { lang: "python/cuda", label: "Python (CUDA)" },
  { lang: "qt5", label: "C++ with Qt" },
];
