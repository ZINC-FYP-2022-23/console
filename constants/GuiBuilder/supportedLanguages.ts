import { SettingsLang } from "@/types/GuiBuilder";

type SupportedLanguage = Pick<SettingsLang, "compiler" | "language"> & {
  /** Label to display in the UI. */
  readonly label: string;
};

/**
 * Supported languages for the `_settings.lang` field in the config YAML.
 *
 * {@link https://docs.zinc.ust.dev/user/model/Config.html#settings-lang}
 */
const supportedLanguages: readonly SupportedLanguage[] = [
  {
    language: "c",
    compiler: "clang",
    label: "C (clang)",
  },
  {
    language: "c",
    compiler: "gcc",
    label: "C (gcc)",
  },
  {
    language: "cpp",
    compiler: "clang++",
    label: "C++ (clang++)",
  },
  {
    language: "cpp",
    compiler: "g++",
    label: "C++ (g++)",
  },
  {
    language: "qt5",
    compiler: null,
    label: "C++ with Qt5",
  },
  {
    language: "java",
    compiler: null,
    label: "Java",
  },
  {
    language: "python",
    compiler: null,
    label: "Python",
  },
  {
    language: "python",
    compiler: "cuda",
    label: "Python (CUDA)",
  },
];

export default supportedLanguages;
