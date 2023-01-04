import { MultiSelectData, SelectItem } from "@components/Input";
import { ChecksFilter, VisibilityValgrind } from "@types";
import { visibilityOptions as testCaseVisibilityOptions } from "../StdioTestSettings";

export const checksFilterOptions: MultiSelectData<ChecksFilter>[] = [
  {
    value: "*",
    label: "All Valgrind errors",
  },
  {
    value: "Leak_*",
    label: "Memory leaks",
  },
  {
    value: "Uninit*",
    label: "Uninitialized variables",
  },
  {
    value: "*Free",
    label: "Memory freeing errors",
  },
];

export const visibilityOptions: SelectItem<VisibilityValgrind>[] = [
  {
    value: "INHERIT",
    label: "Inherit",
    description: "Inherit visibility from the test case",
  },
  ...testCaseVisibilityOptions,
];
