import { MultiSelectData, SelectItem } from "@/components/Input";
import { ChecksFilter, VisibilityValgrind } from "@/types/GuiBuilder";

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
    label: "Same visibility as the test case",
    description: "e.g. If the test case is hidden, then Valgrind information will also be hidden.",
  },
  {
    value: "ALWAYS_VISIBLE",
    label: "Always visible",
    description: "Valgrind information is always available to students",
  },
  {
    value: "ALWAYS_HIDDEN",
    label: "Always hidden",
    description: "Valgrind information is always hidden from students (except its score and whether it has passed)",
  },
  {
    value: "VISIBLE_AFTER_GRADING",
    label: "Visible after grading",
    description: "Valgrind information is visible after the deadline of the assignment",
  },
  {
    value: "VISIBLE_AFTER_GRADING_IF_FAILED",
    label: "Visible after grading if failed",
    description:
      "Valgrind information is visible after the deadline of the assignment only if the test case has failed",
  },
];
