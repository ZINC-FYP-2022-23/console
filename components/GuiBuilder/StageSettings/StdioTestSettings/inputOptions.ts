import { MultiSelectData, SelectItem } from "@/components/Input";
import { DiffIgnoreFlag, HiddenItem, VisibilityTestCase } from "@/types";

export const diffIgnoreFlagOptions: MultiSelectData<DiffIgnoreFlag>[] = [
  {
    value: "TRAILING_WHITESPACE",
    label: "Trailing whitespace",
    description: "Ignores line differences which only differ by trailing whitespace",
  },
  {
    value: "SPACE_CHANGE",
    label: "Space change",
    description: "Ignores line differences which only differ by the change in number and/or type of whitespace",
  },
  {
    value: "ALL_SPACE",
    label: "All space",
    description: "Ignores all types of space changes, including between whitespace and no whitespace",
  },
  {
    value: "BLANK_LINES",
    label: "Blank lines",
    description: "Ignores all changes whose lines are blank",
  },
];

export const hiddenItemOptions: MultiSelectData<HiddenItem>[] = [
  {
    value: "STDIN",
    label: "Standard input",
  },
  {
    value: "STDOUT",
    label: "Standard output",
  },
  {
    value: "STDERR",
    label: "Standard error",
  },
  {
    value: "DIFF",
    label: "Diff between expected and actual output",
  },
];

export const inputModeOptions: SelectItem<"none" | "text" | "file">[] = [
  {
    value: "none",
    label: "None",
  },
  {
    value: "text",
    label: "By text input",
  },
  {
    value: "file",
    label: "From helper file",
  },
];

export const visibilityOptions: SelectItem<VisibilityTestCase>[] = [
  {
    value: "ALWAYS_VISIBLE",
    label: "Always visible",
    description: "Test case information is always available to students",
  },
  {
    value: "ALWAYS_HIDDEN",
    label: "Always hidden",
    description: "Test case information is always hidden from students (except its score and whether it has passed)",
  },
  {
    value: "VISIBLE_AFTER_GRADING",
    label: "Visible after grading",
    description: "Test case information is visible after the deadline of the assignment",
  },
  {
    value: "VISIBLE_AFTER_GRADING_IF_FAILED",
    label: "Visible after grading if failed",
    description:
      "Test case information is visible after the deadline of the assignment only if the test case has failed",
  },
];
