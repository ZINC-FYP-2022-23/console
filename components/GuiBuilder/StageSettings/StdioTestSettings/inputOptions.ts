import { MultiSelectData } from "@components/Input";
import { DiffIgnoreFlag } from "@types";

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
